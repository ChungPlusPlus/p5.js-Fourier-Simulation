let n = 100; // -n ~ n revolution period
let step = 0;

let cwx = [];
let cwy = [];
let ccwx = [];
let ccwy = [];

let dotx = [];
let doty = [];
let ix = [0];
let iy = [0];

let targetN = -1;
let procN = 0;
let t = 0;
let k = 30;
let unit = 0.05;

let showOriginal = false;
let focusMode = true;
let scaleFactor = 7;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-holder');
  reset();
}

function reset() {
  resetMatrix();
  background(0);
  
  step = 1;
  targetN = -1;
  procN = 0;
  t = 0;
  
  k = 30;
  scaleFactor = 7;
  focusMode = true;
  showOriginal = false;

  ix = []; 
  iy = [];
  ix[0] = -1;
  iy[0] = 0;

  dotx = [];
  doty = [];

  cwx = new Array(n + 1).fill(0);
  cwy = new Array(n + 1).fill(0);
  ccwx = new Array(n + 1).fill(0);
  ccwy = new Array(n + 1).fill(0);

  stroke(0);
  fill(0);
  ellipseMode(RADIUS);
}

function draw() {
  if (step === 1) {
    if (mouseIsPressed)
      input();
  } else if (step === 2) {
    process(procN);
    procN++;
  } else if (step === 3) {
    targetN++;
    textSize(32);
    fill(255); // 텍스트 색상 추가
    if (targetN <= n) {
      background(0);
      text("Loading : " + targetN + " / " + n, width / 2 - 100, height - 70);
      solve(targetN);
    } else {
      step = 4;
    }
  } else if (step === 4) { // show result
    background(0);
    
    if (focusMode)
      focus_result(k, t);
    else
      result(k, t);
      
    t += 0.001;
    fill('#FFFF00');
    noStroke();
  }
}

function input() {
  if (ix[0] === -1) {
    ix[0] = mouseX;
    iy[0] = mouseY;
  }

  let prevx = ix[ix.length - 1];
  let prevy = iy[iy.length - 1];
  let l = dist(mouseX, mouseY, prevx, prevy);
  
  if (l > 0) {
    ix.push(mouseX);
    iy.push(mouseY);
    stroke('#FF00FF');
    line(prevx, prevy, ix[ix.length - 1], iy[iy.length - 1]);
  }
}

function end_input() {
    console.log("Input ended.");
    ix.push(ix[0]);
    iy.push(iy[0]);
    step = 2;
}

function process(i) {
  if (i >= ix.length - 1) {
    step = 3;
    return;
  }
  let l = dist(ix[i], iy[i], ix[i + 1], iy[i + 1]);
  for (let j = 0; j < l; j += unit) {
    let tempX = map(j, 0, l, ix[i], ix[i + 1]);
    let tempY = map(j, 0, l, iy[i], iy[i + 1]);
    dotx.push(tempX);
    doty.push(tempY);
  }
  fill('#0000FF');
  noStroke();
  circle(ix[i + 1], iy[i + 1], 5);
}

function solve(currTargetN) {
  let transx = new Array(dotx.length).fill(0);
  let transy = new Array(doty.length).fill(0);
  let sumx = 0;
  let sumy = 0;

  if (currTargetN === 0) {
    for (let i = 0; i < dotx.length; i++) {
      sumx += dotx[i];
      sumy += doty[i];
    }
    cwx[0] = sumx / dotx.length;
    cwy[0] = sumy / dotx.length;
    return;
  }

  // solve cw
  for (let i = 0; i < dotx.length; i++) { 
    let time = map(i, 0, dotx.length, 0, 2 * PI);
    let alpha = currTargetN * time;

    transx[i] = dotx[i] * cos(alpha);
    transy[i] = dotx[i] * sin(alpha);
    sumx += transx[i];
    sumy += transy[i];
  }
  cwx[currTargetN] += sumx / dotx.length;
  cwy[currTargetN] += sumy / dotx.length;
  ccwx[currTargetN] += sumx / dotx.length;
  ccwy[currTargetN] += -sumy / dotx.length;

  sumx = 0; sumy = 0;
  // solve ccw
  for (let i = 0; i < doty.length; i++) { 
    let time = map(i, 0, doty.length, 0, 2 * PI);
    let alpha = currTargetN * time;

    transy[i] = doty[i] * cos(alpha);
    transx[i] = -doty[i] * sin(alpha);
    sumx += transx[i];
    sumy += transy[i];
  }
  cwx[currTargetN] += sumx / dotx.length;
  cwy[currTargetN] += sumy / dotx.length;
  ccwx[currTargetN] += -sumx / dotx.length;
  ccwy[currTargetN] += sumy / dotx.length;
}

function result(m, currentTime) {
  translate(cwx[0], cwy[0]);
  
  // show trajectory
  for (let tem = 0; tem < currentTime; tem += 0.001) {
    push();
    for (let i = 1; i <= m; i++) {
      rotate(2 * PI * i * tem);
      translate(cwx[i], cwy[i]);
      rotate(-2 * PI * i * tem);

      rotate(-2 * PI * i * tem);
      translate(ccwx[i], ccwy[i]);
      rotate(2 * PI * i * tem);
    }
    fill('#2299FF');
    noStroke();
    if (focusMode) circle(0, 0, 2 / scaleFactor);
    else circle(0, 0, 1.5);
    pop();
  }

  translate(-cwx[0], -cwy[0]);
  if (showOriginal) {
    for (let i = 0; i < dotx.length; i += 10 / unit) {
      noStroke();
      fill('#00FF00');
      circle(dotx[idx], doty[idx], 3 / scaleFactor);
    }
  }

  translate(cwx[0], cwy[0]);

  noFill();
  if (focusMode) strokeWeight(3 / scaleFactor);
  else strokeWeight(2);
  
  for (let i = 1; i <= m; i++) {
    stroke(constrain(25 * i, 0, 255), constrain(255 - 20 * i, 0, 255), constrain(200 - 2 * i, 100, 255));

    rotate(2 * PI * i * currentTime);
    line(0, 0, cwx[i], cwy[i]);
    circle(0, 0, dist(0, 0, cwx[i], cwy[i]));
    translate(cwx[i], cwy[i]);
    rotate(-2 * PI * i * currentTime);

    rotate(-2 * PI * i * currentTime);
    line(0, 0, ccwx[i], ccwy[i]);
    circle(0, 0, dist(0, 0, ccwx[i], ccwy[i]));
    translate(ccwx[i], ccwy[i]);
    rotate(2 * PI * i * currentTime);
  }
}

function focus_result(m, currentTime) {
  scale(scaleFactor);
  let end_x = cwx[0];
  let end_y = cwy[0];
  
  for (let i = 1; i <= m; i++) {
    end_x += cwx[i] * cos(-2 * PI * i * currentTime);
    end_y += cwx[i] * -sin(-2 * PI * i * currentTime);
    end_x += cwy[i] * sin(-2 * PI * i * currentTime);
    end_y += cwy[i] * cos(-2 * PI * i * currentTime);

    end_x += ccwx[i] * cos(2 * PI * i * currentTime);
    end_y += ccwx[i] * -sin(2 * PI * i * currentTime);
    end_x += ccwy[i] * sin(2 * PI * i * currentTime);
    end_y += ccwy[i] * cos(2 * PI * i * currentTime);
  }
  translate(-end_x + width / 2 / scaleFactor, -end_y + height / 2 / scaleFactor);

  result(m, currentTime);
}

function keyPressed() {
  console.log("Key:", key, "KeyCode:", keyCode);
  if (key === 'r' || key === 'R') {
    reset();
  }

  if (step === 1 && keyCode === 13) {
    end_input();
    return;
  }
  if (step !== 4) return;

  if (keyCode === 38 ) {
    if (k < n) k++;
    console.log(" " + k + " " + cwx[k] + " " + cwy[k] + " " + ccwx[k] + " " + ccwy[k]);
  } else if (keyCode === 40) {
    if (k > 0) k--;
  } else if (key === 'f' || key === 'F') {
    focusMode = !focusMode;
    return false; 
  } else if (keyCode === 39) {
    if (scaleFactor <= 15) scaleFactor += 0.02;
    console.log(scaleFactor);
  } else if (keyCode === 37) {
    if (scaleFactor >= 0.7) scaleFactor -= 0.02;
    console.log(scaleFactor);
  }
}