/* Luuk Fröling
*   Error 6-2-2018 Sizes do not correspond.
*   Solution: I saved anarray of inputs.
*
*/


class neuralNetwork {
  constructor(sizes){
    //Structure of the network.
    this.lr= 1;
    this.netconfig = sizes;
    this.input = new Matrix(sizes[0]);
    this.hidden = new Matrix(sizes[1]);
    this.output = new Matrix(sizes[2]);
    this.Who = new Matrix(sizes[2], sizes[1]);

    //The time components. These needs to be arrays.
    this.pInput = new Array();
    this.pHidden = new Array();
    this.pOutput = new Array();

    /* Now we need to define all the compinents of the LSTM cell.
    *  Starting off with the weights, which need to be sizes[1] (the hidden layer) as output.
    *  The input will be of sizes input + hidden as the 2 arrays will be concatinated.
    */
    this.Wf = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wf.fill(100);
    this.WfB = 10;
    this.Wi = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wg = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).
    this.Wo = new Matrix(sizes[1], sizes[0] + sizes[1]); // the input size is Input(t) + hidden(t-1).


    //The 'layers' of the lstm cell. With these we calculate inside the cell.
    this.f = new Matrix(sizes[1]);
    this.i = new Matrix(sizes[1]);
    this.g = new Matrix(sizes[1]);
    this.o = new Matrix(sizes[1]);

    //The memory of the layers:
    this.pf = new Array();
    this.pi = new Array();
    this.pg = new Array();
    this.po = new Array();
    this.pc = new Array();

    /* this.c = the cell state. This is to be added to the pCellstate.
    *  this.cellinput will become the matrix which we add the previous hidden state and the input to.
    */
    this.c = new Matrix(sizes[1]);
    this.c.fill(0);
    this.cellInput = new Matrix(0);
  }

  /* Input is an array of input values -> [0,1,0].
  *  We want to concate the input first, and then the hidden array.
  *  Error of 6-2-2018, error definitly not in the activate function.
  */
  activate(data){
    this.input = Matrix.fromArray(data);
    this.cellInput = new Matrix(0);

    this.cellInput = Matrix.concatinateY(this.cellInput, this.input);
    this.cellInput = Matrix.concatinateY(this.cellInput, this.pHidden[this.pHidden.length-1]); //Add the previous hidden states which start at 0;
    this.pInput.push(this.cellInput);

    this.f = Matrix.product(this.Wf, this.cellInput); //Get the result.
    this.f.add(this.WfB);
    this.f.func(sigmoid);
    this.pf.push(this.f);

    //Checked up until here! 29/01/2018
    this.i = Matrix.product(this.Wi, this.cellInput);
    this.i.func(sigmoid);
    this.pi.push(this.i);

    //Checked and worked.
    this.g = Matrix.product(this.Wg, this.cellInput);
    this.g.func(tanH);
    this.pg.push(this.g);
    //Checked till here, worked. 2-2-2018.

    //Get the cell state:
    this.c.scale(this.f);
    this.c.add(Matrix.scale(this.i, this.g));
    this.pc.push(this.c)

    //And finally the hidden state:
    this.o = Matrix.product(this.Wo, this.cellInput);
    this.o.func(sigmoid);
    this.po.push(this.o);


    this.hidden = Matrix.scale(this.c.func(tanH), this.o);
    this.pHidden.push(this.hidden);
    //this.hidden.show();

    //this can be deleted if the network will be used for single output only. Gives extra computation time.
    this.output = Matrix.product(this.Who, this.hidden);
    this.output.func(sigmoid);
    //this.output.show();
  }

  /* A function to run through the array of input data.
  *  Takes input as a parameter. this function must safe all the actions so we can look back at it through time.
  */

  trainingRun(input){
    this.resetTime();
    for(let i = 0; i < input.length; i++){
      this.activate(input[i]);
    }
  }

  /* As the amount of input changes, we will want to change the numbers of inputs and the number of outputs.
  *  To do this we need to change the matrices.
  *  addInput and addOuput are both functions from the matrix class to add a column or a row.
  *  NOTE you need to change the data as well. If you pass in the data with incorrect sizes
  *  an error will occur.
  */

  addInput(){
    //Here we need to change all the weights which use the input values.
    this.Wf = Matrix.addInput(this.Wf);
    this.Wi = Matrix.addInput(this.Wi);
    this.Wo = Matrix.addInput(this.Wo);
    this.Wg = Matrix.addInput(this.Wg);
    this.netconfig[0]++;
  }

  addOuput(){
    //We need to call all the matrices which need the size of the output. thus in this case only the weights from hidden to output.
    this.Who = Matrix.addOutput(this.Who);
  }

  /* Weneed a function we can call to actually use the network.
  *  TrainingRun is used to run the network without any output/console.log.
  *  Run will output the result and return it inside of a string for further data processing.
  */

  run(input){
    this.resetTime();
    for(let i = 0; i < input.length; i++){
      this.pInput.push(input[i]);
      this.activate(input[i]);
    }
    return Matrix.toArray(this.output);
  }

  /* So a different run function which returns an array with only 1 value made high.
  *  this has a better preactical use in the implementation of the neural network.
  */
  runResult(input){
    this.resetTime();
    for(let i = 0; i < input.length; i++){
      this.pInput.push(input[i]);
      this.activate(input[i]);
    }

    let topIndex = 0; let top = 0;
    let output = Matrix.toArray(this.output);
    let result = new Array(output.length);
    result.fill(0);

    for(let i = 0; i < output.length; i++){
      if(output[i] > top){
        topIndex = i;
        top = output[i];
      }
    }

    result[topIndex] = 1;
    return result;
  }
  /* A training function. takes array of input and array of desired output as parameters.
  *  We must loop through all the inputs to create the through time effect.
  */
  train(input, desired){
    this.trainingRun(input);
    let error = Matrix.substract(Matrix.fromArray(desired), this.output);
    this.error = error;
    /* Adjust the hidden to output layer of weights.
    *  Then adjust the error to make it ready for bacprop. through time.
    */
    let WhoT = Matrix.transpose(this.Who);
    let hiddenT = Matrix.transpose(this.hidden);

    let WhoC = Matrix.product(error, hiddenT);
    WhoC.scale(this.lr);
    this.Who.add(WhoC);

    error = Matrix.product(WhoT, error);

    /* Now we need to go back through time.
    *  First of all we need to loop through all the timesteps we have taken.
    *  T - i can be used. Herein T is the total amount of timesteps counted from 0 and i = timesteps.length.
    *  In the end we need to multiply by the forget gate
    *  The error vector carries the derivative back.
    *  Before backpropagating the cell states we need to pass it through the 'hidden' filter
    *  and through the derivative of the TANH of the cell state at that moment in time.
    *  As that is the only time we make use of the hidden state, we only adjust o at that point in time.
    */

    //Pass the error through the Fo gate:
    error = Matrix.scale(this.po[this.po.length-1], error);

    //Change the o value with the transposed input:
    let Ti = Matrix.transpose(this.pInput[this.pInput.length-1]);
    let WoC = Matrix.product(error, Ti);
    this.Wf.add(WoC);

    //We need to enter the network via the tanH function. This is necessary it
    //Will not wor without this unlike the sigmoid derivatives!
    error = Matrix.scale(this.pc[this.pc.length-1].func(dtanH), error);

    let t = input.length;

    for(let i = 1; i < input.length; i++){
      //console.log("in here");
      let Tinput = Matrix.transpose(this.pInput[t-i]);

      //  this.WfB += error.getSum();
      let WfC = Matrix.product(error, Tinput);


      this.Wf.add(WfC);

      let WiC = Matrix.scale(error, this.pg[t-i]);
      WiC = Matrix.product(error, Tinput);
      this.Wi.add(WiC);

      let WgC = Matrix.scale(error, this.pi[t-i]);
      WgC = Matrix.product(error, Tinput);
      this.Wg.add(WgC);

      // let WoC

      error = Matrix.scale(error, this.pf[t - i]); //The the step where data is and i the amount we have stepped back in time.
    }
  }


  /* After every run we need to reset the through time datasets.
  *  This will restore it back to default settings.
  *  The time 'memomry' consits of a couple of arrays don't forgett.
  */
  resetTime(){
    this.pInput = new Array();
    this.pHidden = new Array();
    this.pOutput = new Array();
    this.pc = new Array();
    this.pf = new Array();
    this.pi = new Array();
    this.pg = new Array();
    this.po = new Array();
    //Fill pHidden with 0's.
    let temp = new Matrix(this.netconfig[1]);
    temp.fill(0);
    this.pHidden.push(temp);
    this.pc.push(temp);
    this.c = new Matrix(this.netconfig[1]);
    this.c.fill(0);
  }

/* A function we want to use to change the data we get from a json file into
*  a working object. We need to convert the objects into the matrix class so we can
*/
  static fromJSON(data){
    let result = new neuralNetwork(data.netconfig);
    result.Wf = Matrix.fromJSON(data.Wf);
    result.Wg = Matrix.fromJSON(data.Wg);
    result.Who = Matrix.fromJSON(data.Who);
    result.Wi = Matrix.fromJSON(data.Wi);
    result.Wo = Matrix.fromJSON(data.Wo);
    result.c = Matrix.fromJSON(data.c);
    result.cellInput = Matrix.fromJSON(data.cellInput);
    result.f = Matrix.fromJSON(data.f);
    result.g = Matrix.fromJSON(data.g);
    result.hidden = Matrix.fromJSON(data.hidden);
    result.i = Matrix.fromJSON(data.i);
    result.o = Matrix.fromJSON(data.o);
    result.output = Matrix.fromJSON(data.output);
    return result;
  }
}

function sigmoid(x) {
    return 1/(1+Math.pow(Math.E, -x));
}

function sigmoidD(x){
  return sigmoid(x) * (1-sigmoid(x));
}

function tanH(x){
  return Math.tanh(x);
}

function dtanH(x){
  return(1 - (tanH(x) * tanH(x)));
}
