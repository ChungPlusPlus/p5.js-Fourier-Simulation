//Made in 2021
//Ref: https://www.youtube.com/watch?v=VqeGQkRaSSg
// Original code of this project

int n=100; int step=0;// -n ~ n revolution period
float[] cwx=new float[n+1]; float[] cwy=new float[n+1];
float[] ccwx=new float[n+1]; float[] ccwy=new float[n+1];
float[] dotx=new float[0]; float[] ix=new float[1];
float[] doty=new float[0]; float[] iy=new float[1];
int targetN=-1; int procN=0;
float t=0; int k=30;
float unit=0.05;

boolean showOriginal = false;
boolean focusMode = true;
float scaleFactor = 7;

void setup()
{
  size(800,600);
  stroke(0);
  fill(0);
  ix[0]=-1; step=1;
  background(0);
  ellipseMode(RADIUS);
}

void draw()
{
  if(step==1)
  {
    if(mousePressed)
      input();
  }
  else if(step==2)
  {
    process(procN); procN++;
  }
  else if(step==3)
  {
    targetN++;
    textSize(32);
    if(targetN<=n) {
      background(0); 
      text("Loading : "+targetN+" / "+n,width/2, height-70);
      solve(targetN);
    }
    else
    {
      step=4;
    }
  }
  else if(step==4)//show result
  {
    background(0);
    //fill(0);
    // textSize(40);
    // text("vector : " + k,width/2+120,50);
    if(focusMode)
      focus_result(k,t);
    else
      result(k, t);
    t+=0.001;
    fill(#FFFF00); noStroke();
  }
}

void input()
{
  if(ix[0]==-1) {ix[0]=mouseX; iy[0]=mouseY;}
  
  float prevx=ix[ix.length-1];
  float prevy=iy[iy.length-1];
  float l=dist(mouseX,mouseY,prevx,prevy);
  if(l>0)
  {
    ix=(float[])append(ix,mouseX);
    iy=(float[])append(iy,mouseY);
    stroke(#FF00FF);
    line(prevx,prevy,ix[ix.length-1],iy[iy.length-1]);
  }
   
  if(mouseButton==RIGHT)
  {
    ix=(float[])append(ix,mouseX);
    iy=(float[])append(iy,mouseY);
    ix=(float[])append(ix,ix[0]);
    iy=(float[])append(iy,iy[0]);
    step=2;
  }
}

void process(int i)
{
  if(i>=ix.length-1)
  {
    step=3; return;
  }
  float l=dist(ix[i],iy[i],ix[i+1],iy[i+1]);
  for(float j=0; j<l; j+=unit)
  {
    float tempX=map(j,0,l,ix[i],ix[i+1]);
    float tempY=map(j,0,l,iy[i],iy[i+1]);
    dotx=(float[])append(dotx,tempX);
    doty=(float[])append(doty,tempY);
  }
  fill(#0000FF); circle(ix[i+1],iy[i+1],5);
}

void solve(int targetN)
{
  float[] transx=new float[dotx.length];
  float[] transy=new float[doty.length];
  float sumx=0; float sumy=0;
  if(targetN==0)
  {
    for(int i=0; i<dotx.length; i++)
    {
      sumx+=dotx[i];
      sumy+=doty[i];
    }
    cwx[0]=sumx/dotx.length;
    cwy[0]=sumy/dotx.length;
    return;
  }
  
  for(int i=0; i<dotx.length; i++) //solve cw
  {
    float time=map(i,0,dotx.length,0,2*PI);
    float alpha=targetN*time;
    
    transx[i]=dotx[i]*cos(alpha);
    transy[i]=dotx[i]*sin(alpha);
    sumx+=transx[i];
    sumy+=transy[i];
  }
  cwx[targetN]+=sumx/dotx.length;
  cwy[targetN]+=sumy/dotx.length;
  ccwx[targetN]+=sumx/dotx.length;
  ccwy[targetN]+=-sumy/dotx.length;
  
  sumx=sumy=0;
  for(int i=0; i<doty.length; i++)//solve ccw
  {
    float time=map(i,0,doty.length,0,2*PI);
    float alpha=targetN*time;
    
    transy[i]=doty[i]*cos(alpha);
    transx[i]=-doty[i]*sin(alpha);
    sumx+=transx[i];
    sumy+=transy[i];
  }
  cwx[targetN]+=sumx/dotx.length;
  cwy[targetN]+=sumy/dotx.length;
  ccwx[targetN]+=-sumx/dotx.length;
  ccwy[targetN]+=sumy/dotx.length;
}

void result(int m, float t)
{
  translate(cwx[0],cwy[0]);
  //show trajectory
  for(float tem=0; tem<t; tem+=0.001)
  {
    pushMatrix();
    for(int i=1; i<=m; i++)
    {
      rotate(2*PI*i*tem);
      translate(cwx[i],cwy[i]);
      rotate(-2*PI*i*tem);
      
      rotate(-2*PI*i*tem);
      translate(ccwx[i],ccwy[i]);
      rotate(2*PI*i*tem);
    }
    fill(#2299FF);
    if(focusMode) circle(0,0,2/scaleFactor);
    else circle(0,0,2);
    popMatrix();
  }
  
  translate(-cwx[0],-cwy[0]);
  if(showOriginal)
    for(int i=0; i<dotx.length; i+=10/unit)
    {
      noStroke();
      fill(#00FF00);
      circle(dotx[i],doty[i],3/scaleFactor);
    }
  
  translate(cwx[0],cwy[0]);
  
  noFill();
  if(focusMode) strokeWeight(3/scaleFactor);
  else strokeWeight(3);
  for(int i=1; i<=m; i++)
  {
    stroke(constrain(25*i,0,255),constrain(255-20*i,0,255),constrain(200-2*i,100,255));
    
    rotate(2*PI*i*t);
    line(0,0,cwx[i],cwy[i]);
    circle(0,0,dist(0,0,cwx[i],cwy[i]));
    translate(cwx[i],cwy[i]);
    rotate(-2*PI*i*t);
    
    rotate(-2*PI*i*t);
    line(0,0,ccwx[i],ccwy[i]);
    circle(0,0,dist(0,0,ccwx[i],ccwy[i]));
    translate(ccwx[i],ccwy[i]);
    rotate(2*PI*i*t);
  }
}

void focus_result(int m, float t)
{
  scale(scaleFactor);
  float end_x = cwx[0];
  float end_y = cwy[0];
  for(int i=1; i<=m; i++) {
     end_x += cwx[i] * cos(-2*PI*i*t);
     end_y += cwx[i] * -sin(-2*PI*i*t);
     end_x += cwy[i] * sin(-2*PI*i*t);
     end_y += cwy[i] * cos(-2*PI*i*t);
     
     end_x += ccwx[i] * cos(2*PI*i*t);
     end_y += ccwx[i] * -sin(2*PI*i*t);
     end_x += ccwy[i] * sin(2*PI*i*t);
     end_y += ccwy[i] * cos(2*PI*i*t);
  }
  translate(-end_x+width/2/scaleFactor,-end_y+height/2/scaleFactor);
  
  result(m,t);
}

void keyPressed()
{
  if(step!=4) return;
  
  if(keyCode==UP)
  {
    if(k<n) k++;
    println(" "+k+" "+cwx[k]+" "+cwy[k]+" "+ccwx[k]+" "+ccwy[k]);
  }
  else if(keyCode==DOWN)
  {
    if(k>0) k--;
  }
  else if(keyCode==TAB)
  {
    focusMode = !focusMode;
  }
  else if(keyCode==RIGHT)
  {
    if(scaleFactor <= 15) scaleFactor += 0.02;
    print(scaleFactor);
  }
  else if(keyCode==LEFT)
  {
    if(scaleFactor >= 0.7) scaleFactor -= 0.02;
    print(scaleFactor);
  }
}
