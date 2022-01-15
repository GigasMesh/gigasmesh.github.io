const clearBtn = document.querySelector("#btn-clear")
const confirmBtn = document.querySelector("#btn-confirm")
const zoomBtn = document.querySelector(".zoom")
const colorBtn = document.querySelector(".color")
const colorPicker = document.querySelector('.colorPicker')

var radio = document.querySelector('input[type=radio]:checked');
var size = 10;


window.addEventListener('load',() => {
   const canvas = document.querySelector("#canvas");
   const ctx = canvas.getContext("2d");

   var points = [];
   ctx.canvas.width  = 16*size;
   ctx.canvas.height = 9*size;

   function  getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect(), // abs. size of element
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
      return;
   }

   function eraser(e) {
      var mousePos = getMousePos(canvas,e);

      ctx.clearRect(Math.floor(mousePos.x)-5, Math.floor(mousePos.y)-5, 10, 10)
      return;
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
      return;
   }


   function drawLine(e) {
      if (points.length < 1) {
         points.push(getMousePos(canvas, e));
         drawInitialPixel(points[0].x, points[0].y)
         return;
      }
      else {
         points.push(getMousePos(canvas, e));
         line(Math.floor(points[0].x), Math.floor(points[0].y), Math.floor(points[1].x), Math.floor(points[1].y));
         points = [];
         return;
      }
   }
  
   function addPoints(e){
      point = getMousePos(canvas, e)
      drawInitialPixel(point.x, point.y)
      points.push(point)

   }
   function polygon(e){    
      for(var i = 0; i < points.length; i++) {
         if (i === (points.length-1)){
            console.log('entrou no if')
            point0 = points[i]
            point1 = points[0]   
         }
         else{
            var point0 = points[i]
            var point1 = points[i+1]
         }  
         console.log(point0.x, point0.y, point1.x, point1.y) 
         line(Math.floor(point0.x), Math.floor(point0.y), Math.floor(point1.x),Math.floor(point1.y))

       } 
       points = []
   }

   function pixel(x,y){
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
      return;
   }

   function drawInitialPixel(x,y){
      ctx.fillStyle = 'gray';
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1)
      ctx.fillStyle = 'black';
      return;
   }

   function deletePixel(x,y){
      ctx.clearRect(Math.floor(x), Math.floor(y), 1, 1)
      return;
   }



   function drawCircle(e){
      if (points.length < 1) {
         points.push(getMousePos(canvas, e));
         drawInitialPixel(points[0].x, points[0].y)
         return;
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
         i = 0;
         points = []
         return;
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
   }

   canvas.addEventListener("click", handleFunction);

   function selectAlgotithm(e){
      if (radio.value === 'Polygon') {
         canvas.addEventListener("click", polygon(e));
      }   
   }
   function clearCanvas(e){
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      points = []
   }
   confirmBtn.addEventListener('click',selectAlgotithm);
   clearBtn.addEventListener('click',clearCanvas);

});


