/*
* Created on the 26/01/2018 by Luuk Fröling.
* Generate matrix, which is an array filled with arrays.
* We want to have a structure like Matrix[output.length][input.length]. Output and input refer to the neural networks.
* We take output as the first parameter, as we want to be able to put the input as a 1 if nothing is passed as a parameter.
* Giving 1 number as a parameter will create an array, which can be proccesed in this 'library'.
* Within neural networks, this can be a layer.
* X and Y are based on how the matrix is viewed in the console.
*/

class Matrix {

  constructor(output, input = 1){
    this.x = input;
    this.y = output;

    this.matrix = new Array(); //Create a new array we can fill up.
    for(let i = 0; i < this.y; i++){
      let temp = [];
      for(let j = 0; j < this.x; j++){
        temp.push(Math.random() * 2 - 1); //Push a random value between -1 and 1 in the matrix.
      }
      this.matrix.push(temp);
    }
  }
/* Returns the sumof all the values inside the matrix.
*  In neural networks, this can be used to add all the errors to
*  add to the bias.
*/
  getSum(){
    let sum = 0;
    for(let i = 0; i < this.y; i++){
      for(let j = 0; j < this.x; j++){
        sum += this.matrix[i][j];
      }
    }
    return sum;
  }
/* Add a specific number to every element ( if a single number is passed as an argument).
*  When another instance of Matrix is passed, tThe numbers are added element wise.
*/
  add(factor){
    if(factor instanceof Matrix){
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] += factor.matrix[i][j];
        }
      }
    } else {
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] += factor;
        }
      }
    }
  }

  static add(m1, m2){
    if(m1.x !== m2.x || m1.y !== m2.y){
      console.log("wrong sizes");
      return false;
    }
    let result = new Matrix(m1.y, m1.x)
    for(let i = 0; i < m1.y; i++){
      for(let j = 0; j < m1.x; j++){
        result.matrix[i][j] = m1.matrix[i][j] + m2.matrix[i][j];
      }
    }
    return result;
  }

/* Now we basically do the same for substract.
*  With bots a static and a non static function,
*  as I can just copy the above and change a + to a -.
*/
  substract(factor){
    if(factor instanceof Matrix){
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] -= factor.matrix[i][j];
        }
      }
    } else {
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] -= factor;
        }
      }
    }
  }

  static substract(m1, m2){
    if(m1.x !== m2.x || m1.y !== m2.y){
      console.log("wrong sizes");
      return false;
    }
    let result = new Matrix(m1.y, m1.x)
    for(let i = 0; i < m1.y; i++){
      for(let j = 0; j < m1.x; j++){
        result.matrix[i][j] = m1.matrix[i][j] - m2.matrix[i][j];
      }
    }
    return result;
  }

/* As the vocab array increases we want to increase the number of inputs in the weight matrices.
*  We want to be able to do the same to the outputs.
*/

  static addInput(m1){
    return Matrix.concatinateX(m1, new Matrix(m1.y));
  }

  static addOutput(m1){
    return Matrix.concatinateY(m1,  Matrix.transpose(new Matrix(m1.x)));
  }

/* We need a function to apply a function to a matrix.
*  This function can be passed in and will be applied.
*  We don't need this to be a static function, as we don't want to return
*  a new matrix as output. We just want to apply this over a matrix.
*/
  func(fn){
    for(let i = 0; i < this.y; i++){
      for(let j = 0; j < this.x; j++){
        let val = this.matrix[i][j];
        this.matrix[i][j] = fn(val);
      }
    }
    return this;
  }

/* Multiply every number in the matrix with a specific scalar.
*  If another instance of Matrix is given as a parameter we multiply
*  element wise.
*/
  scale(factor){
    if(factor instanceof Matrix){
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] *= factor.matrix[i][j];
        }
      }
    } else {
      for(let i = 0; i < this.y; i++){
        for(let j = 0; j < this.x; j++){
          this.matrix[i][j] *= factor;
        }
      }
    }
  }

  static scale(m1, m2){
    let result = new Matrix(m1.y, m1.x);
    for(let i = 0; i < m1.y; i++){
      for(let j = 0; j < m1.x; j++){
        result.matrix[i][j] = m1.matrix[i][j] * m2.matrix[i][j];
      }
    }
    return result;
  }
/*Fill the entire matrix with the specified number.
* This works with a number only. Kinda obvious i guess...
*/
  fill(x){
    for(let i = 0; i < this.y; i++){
      for(let j = 0; j < this.x; j++){
        this.matrix[i][j] = x;
      }
    }
  }
/* Randomise the content of the matrix. The matrix keeps all specified sizes.
*  We need to push all the numbers in, as javascript will otherwise store it as a poiner (as it is called in c++ not sure about javascript).
*  The nubers will be between -1 and 1.
*/
  randomize(){
    this.matrix = [];
    for(let i = 0; i < this.y; i ++){
      let temp = [];
      for(let j = 0; j < this.x; j++){
        temp.push(Math.random() * 2 - 1);
      }
      this.matrix.push(temp);
    }
  }
/*  Because it is easier to test with numbers from one to 10,
*   this function helps us do that. X can be changed but is 10 by default.
*/
  testdata(x = 10){
    this.matrix = [];
    for(let i = 0; i < this.y; i ++){
      let temp = [];
      for(let j = 0; j < this.x; j++){
        temp.push(Math.floor(Math.random() * x));
      }
      this.matrix.push(temp);
    }
  }
/* A function where we can input an array and convert it to a usable matrix.
*  The matrix will have a x value of 1, and a y value of the size of the layer.
*  Static function to make it more usable. Also because it solved a bug I found annoying
*  Later, to copy the input I found it handy to make a non-static function as well.
*/
  static fromArray(arr){
    let result = new Matrix(arr.length, 1);
    for(let i = 0; i < arr.length; i++){
      result.matrix[i][0] = arr[i];
    }
    return result;
  }

  fromArray(a){
    for(let i = 0; i < a.length; i++){
      this.matrix[i][0] = arr[i];
    }
  }
/* And ofcourse we must be able to go back to an array from a matrix.
*  Because this class supports arrays being passed in it is not a problem.
*/
  static toArray(m){
    let result = new Array();
    for(let i = 0; i < m.y; i++){
      result.push(m.matrix[i][0]);
    }
    return result;
  }
/* During a backpropagation process we want to take the error back.
*  To make the resulting matrix fit we need to transpose a matrix.
*  X becomes y and the other way around.
*/
  transpose(){
    let result = this;
    for(let i = 0; i < this.y; i++){
      for(let j = 0; j < this.x; j++){
        this.matrix[j][i] = result.matrix[i][j];
      }
    }
  }

  static transpose(m){
    let result = new Matrix(m.x, m.y);
    for(let i = 0; i < m.y; i++){
      for(let j = 0; j < m.x; j++){
        result.matrix[j][i] = m.matrix[i][j];
      }
    }
    return result;
  }

/*The matrix product.
* So the result matrix has the size with the x of the input and the y of the object itself.
* So we need to have a matrix of weights with Matrix(Inputs, output).
* The matrix with inputs must be given as a parameter.
* This can be used in a neural network to calculate the hidden layer with size of output specified above.
*
* This is a static method so it is easier to use in a way that we get another array out of it. Use this function as:
* Matrix.product(m1, m2). remind yourself that m1 * m2 !== m2 * m1.
*/
  static product(m1, m2){
    if(m2 instanceof Array){
      m2 = Matrix.fromArray(m2);
    }
    if(m1.x != m2.y) {
      console.log("m1 x = ", m1.x, "- m2 y = ", m2.y);
      console.log("unequal sizes");
      return false; //If length of cols != length of rows we need to return an error to exit the function.
    }
    let result = new Matrix(m1.y, m2.x);
    result.fill(0);
    for(let i = 0; i < m1.y; i++){
      for(let j = 0; j < m2.x; j++){
        let sum = 0;
        for(let k = 0; k < m1.x; k++){
          sum += m1.matrix[i][k] * m2.matrix[k][j];
        }
        result.matrix[i][j] = sum;
      }
    }
    return result;
  }
/* An add function. This is ment to be used if the matrix is used as an array.
* This function will add the 2 given in the parameters together.
* Within the neural networks this is used to add the input and hidden layer together, so it can be processed into the weights.
*/
  static concatinateY(m1, m2){
    if(m2 instanceof Array){
      console.log(m1.y, m2.length);
      let result = new Matrix(m1.y + m2.length);
      for(let i = 0; i < m1.y; i++){
        result.matrix[i][0] = m1.matrix[i][0];
      }
      for(let i = m1.y; i < m1.y + m2.length; i++){
        result.matrix[i][0] = m2[i - m1.y];
      }
      return result;
    } else {
      let result = new Matrix(m1.y + m2.y, m1.x);
      for(let i = 0; i < m1.y; i++){
        for(let j = 0; j < m1.x; j++){
          result.matrix[i][j] = m1.matrix[i][j];
        }
      }
      for(let i = m1.y; i < m1.y + m2.y; i++){
        for(let j = 0; j < m1.x; j++){
          result.matrix[i][j] = m2.matrix[i - m1.y][j];
        }
      }
      return result;
    }
  }

  static concatinateX(m1, m2){
    let result = new Matrix(m1.y, m1.x + m2.x);
    for(let i = 0; i < m1.y; i++){
      for(let j = 0; j < m1.x; j++){
        result.matrix[i][j] = m1.matrix[i][j];
      }
    }
    for(let i = 0; i < m1.y; i++){
      for(let j = m1.x; j < m1.x + m2.x; j++){
        result.matrix[i][j] = m2.matrix[i][j - m1.x];
      }
    }
    return result;
  }

  /* I will leave in the older version of the function as well to prevent
  *  some of my older programs from breaking. And maybe this is easier to use.
  *  This concatinate will basically add 2 arrays together in the form of a matrix.
  */

  static concatinate(m1, m2){
    if(m2 instanceof Array){
      let result = new Matrix(m1.y + m2.length);
      for(let i = 0; i < m1.y; i++){
        result.matrix[i][0] = m1.matrix[i][0];
      }
      for(let i = m1.y; i < m1.y + m2.length; i++){
        result.matrix[i][0] = m2[i - m1.y];
      }
      return result;
    } else {
      let result = new Matrix(m1.y + m2.y);
      for(let i = 0; i < m1.y; i++){
        result.matrix[i][0] = m1.matrix[i][0];
      }
      for(let i = m1.y; i < m1.y + m2.y; i++){
        result.matrix[i][0] = m2.matrix[i - m1.y][0];
      }
      return result;
    }
  }
/* Show the matrix in a table. This happens in the console.
*  This.y and this.x correspond with the positions in the table.
*/
  show(){
    console.table(this.matrix);
  }
}
