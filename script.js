let n;
let run = 50;
let data = [
  [[[0,1]], [1,0,0]],
  [[[1,0]], [0,1,0]],
  [[[-1,-1]], [0,0,1]]
]

function setup() {
  n = new neuralNetwork([5, 10, 3]);
}

function keyPressed(){
  //n.train(data, [0,0]);
  for(let i = 0; i < run; i++){
    for(let j = 0; j < data.length; j++){
      n.train(data[j][0], data[j][1])
    }
  }
  for(let j = 0; j < data.length; j++){
    n.train(data[j][0], data[j][1])
    n.error.show();
  }
}
function draw() {

}
