const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const clearBtn = document.querySelector("#btn-clear")
const confirmBtn = document.querySelector("#btn-confirm")
const size = 10;

let radio = document.querySelector('input[type=radio]:checked');


window.addEventListener('load',() => {

   confirmBtn.addEventListener('click',confirmOperation);
   clearBtn.addEventListener('click',clearCanvas);
   canvas.addEventListener("click", handleFunction);

   var points = [];
   var markupPoints = [];

   ctx.canvas.width  = 16*size;
   ctx.canvas.height = 9*size;

   function  getMousePos(canvas, evt) {
      const rect = canvas.getBoundingClientRect(), // abs. size of element
          scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
          scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

      return {
         x: (evt.clientX - rect.left) * scaleX  ,   // scale mouse coordinates after they have
         y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
      }
   }

   function drawPixel(e){
      var mousePos = getMousePos(canvas,e);

      pixel(mousePos.x,mousePos.y)
   }

   function eraser(e) {
      var mousePos = getMousePos(canvas,e);

      ctx.clearRect(Math.floor(mousePos.x)-5, Math.floor(mousePos.y)-5, 10, 10)
   }

   function line(x0,y0,x1,y1){
      var dx = Math.abs(x1 - x0);
      var dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1;
      var sy = (y0 < y1) ? 1 : -1;
      var error = dx - dy;

      while(true) {
         ctx.fillRect(x0, y0, 1,1);

         if ((x0 === x1) && (y0 === y1)) break;
         var e2 = 2*error;
         if (e2 > -dy) { error -= dy; x0  += sx; }
         if (e2 < dx) { error += dx; y0  += sy; }
      }
   }

   function drawLine(e) {
      if (points.length < 1) {
         points.push(getMousePos(canvas, e));
         drawInitialPixel(points[0].x, points[0].y)
      }
      else {
         points.push(getMousePos(canvas, e));
         line(Math.floor(points[0].x), Math.floor(points[0].y), Math.floor(points[1].x), Math.floor(points[1].y));
         points = [];
      }
   }
  
   function addPoints(e){
      let point = getMousePos(canvas, e)
      drawInitialPixel(point.x, point.y)
      points.push(point)
   }

   function polygon(){
      for(let i = 0; i < points.length; i++) {
         if (i === (points.length-1)){
            point0 = points[i]
            point1 = points[0]   
         }
         else{
            var point0 = points[i]
            var point1 = points[i+1]
         }
         line(Math.floor(point0.x), Math.floor(point0.y), Math.floor(point1.x),Math.floor(point1.y))
       }
       points = []
   }

   function pixel(x,y,color='black'){
      ctx.fillStyle = color
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
      ctx.fillStyle = 'black'
   }

   function drawInitialPixel(x,y){
      pixel(x,y,'gray')
   }

   function deletePixel(x,y){
      ctx.clearRect(Math.floor(x), Math.floor(y), 2, 2)
   }

   function drawCircle(e){
      if (points.length < 1) {
         points.push(getMousePos(canvas, e));
         drawInitialPixel(points[0].x, points[0].y)
      }

      else {
         deletePixel(points[0].x, points[0].y)
         points.push(getMousePos(canvas, e));
         var a = Math.abs(points[0].x - points[1].x);
         var b = Math.abs(points[0].y - points[1].y);
         var radius = Math.sqrt(a * a + b * b);
         radius = Math.round(radius);

         var x0 = points[0].x;
         var y0 = points[1].y;

         var x = radius;
         var y = 0;
         var radiusError = 1 - x;

         while (x >= y) {
            pixel(x + x0, y + y0);
            pixel(y + x0, x + y0);
            pixel(-x + x0, y + y0);
            pixel(-y + x0, x + y0);
            pixel(-x + x0, -y + y0);
            pixel(-y + x0, -x + y0);
            pixel(x + x0, -y + y0);
            pixel(y + x0, -x + y0);
            y++;

            if (radiusError < 0) {
               radiusError += 2 * y + 1;
            }
            else {
               x--;
               radiusError += 2 * (y - x + 1);
            }
         }
         points = []
      }
   }

   function drawCurve(e){
      if (markupPoints.length < 2) {
         let point = getMousePos(canvas, e);
         markupPoints.push(point);
         pixel(point.x, point.y,'red')
      }
      else {
         addPoints(e)
      }
   }

   function curve(){
      points.push(markupPoints[1]);
      for (const point in points) {
         deletePixel(points[point].x,points[point].y)
      }
      const numLines = points.length / 2 + 2;
      for (let i = 1; i <= numLines; i++) {
         const t = (1.0 / numLines) * i;
         let a = bezierPoint(t);
         line(Math.floor(markupPoints[0].x), Math.floor(markupPoints[0].y), Math.floor(a.x),Math.floor(a.y));
         markupPoints[0] = a;
      }
      markupPoints = [];
      points = [];
   }

   function bezierPoint(t){
      const degree = points.length - 1;
      for (let r = 1; r <= degree; r++) {
         for (let i = 0; i <= degree - r; i++) {
            const firstMultiplication = math.multiply([points[i].x,points[i].y], (1.0 - t));
            const secondMultiplication = math.multiply([points[i+1].x,points[i+1].y], t);

            let add = math.add(firstMultiplication, secondMultiplication);
            points[i] = {x: add[0], y:add[1]}
         }
      }
      return points[0]
   }

   function confirmOperation(e){
      if (radio.value == 'Polygon') {
         polygon(e)
      }
      else if(radio.value == 'Curve') {
         curve(e)
      }
   }

   function handleFunction(e){
      radio = document.querySelector('input[type=radio]:checked');

      if (radio.value == 'Pixel') {
         canvas.addEventListener("click", drawPixel(e));
      }
      else if (radio.value == 'Line') {
         canvas.addEventListener("click", drawLine(e));
      }
      else if (radio.value == 'Circle') {
         canvas.addEventListener("click", drawCircle(e));
      }
      else if (radio.value == 'Eraser') {
         canvas.addEventListener("click", eraser(e));
      }
      else if (radio.value == 'Polygon') {
         canvas.addEventListener("click",addPoints(e))
      }
      else if (radio.value == 'Curve') {
         canvas.addEventListener("click", drawCurve(e))
      }
   }
   function clearCanvas(e){
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      points = []
   }
});


