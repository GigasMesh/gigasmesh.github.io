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
   window.addEventListener("click", newHandleFunction);
   var points = [];
   var markupPoints = [];
   var lastPolygon = Object(); //salva o ultimo poligono e suas arestas
   lastPolygon.edges = [];
   lastPolygon.extremities;
   lastPolygon.vertices = [];
   var newLastPolygon = []
   var i = 0
   ctx.canvas.width  = 16*size;
   ctx.canvas.height = 9*size;
   window.width = 16*size;
   window.height = 9*size

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
      console.log(mousePos.x,mousePos.y)
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
      var edge = []
      while(true) {
         ctx.fillRect(x0, y0, 1,1);
         if ((radio.value == 'Polygon') || (radio.value == 'Replace') || (radio.value == 'Rotate') || (radio.value == 'Scale')){
            var point = new Object()
            point.x = x0
            point.y = y0
            edge.unshift(point) 
         }

         if ((x0 === x1) && (y0 === y1)){
            lastPolygon.edges.push(edge)
            edge = [];
            break;
         }
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

   function selectExtremities(e){
      for(let i = 0; i < points.length; i++){
         if (i == 0){
            maxX = points[i].x
            maxY = points[i].y
            minX = points[i].x
            minY = points[i].y
         }
         else{
            if (points[i].x > maxX){
               maxX = points[i].x
            }
            if (points[i].y > maxY){
               maxY = points[i].y
            }
            if (points[i].x < minX){
               minX = points[i].x
            }
            if (points[i].y < minY){
               minY = points[i].y
            }
         }
      }
      lastPolygon.extremities.push(Math.floor(maxX),Math.floor(maxY),Math.floor(minX),Math.floor(minY))
   }

   function newPolygon(){
      lastPolygon.edges = [];
      lastPolygon.extremities = [];
      lastPolygon.vertices = [];
   }
   
   function polygon(){
      newPolygon()
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
       selectExtremities()
       lastPolygon.vertices = points
       console.log(lastPolygon)
       points = []
       i = 1
   }

   function verifyColision(pixel){
      for(let i = 0; i < lastPolygon.edges.length; i++){
         for(let j = 0; j < lastPolygon.edges[i].length; j++){
            if((pixel.x == lastPolygon.edges[i][j].x) && (pixel.y == lastPolygon.edges[i][j].y)){
               console.log('entrou no if')
               return true;
            }
         }
      }
      return false;
   }

   function scanLine(e){
      var inEdge = false
      if (i == 0){
         return;
      }
      var colision = -1
      var maxX = lastPolygon.extremities[0];
      var maxY = lastPolygon.extremities[1];
      var minX = lastPolygon.extremities[2];
      var minY = lastPolygon.extremities[3];
      for(let i = minY; i < maxY; i++){
         for(let j = minX; j < maxX; j++){
            var point = Object()
            point.y = i 
            point.x = j
            if(verifyColision(point)){
               if (inEdge){
                  continue;
               }
               colision = colision * -1
               inEdge = true
               continue;
            }
            else {
               inEdge = false
            }
            if ((colision == 1) && (inEdge == false)){
               pixel(point.x,point.y,'red')
            }             
         }
         inEdge = false
         colision = -1
      }
   }
   
   function deletePolygon(){
      for(let i = 0; i < lastPolygon.edges.length; i++){
         for(let j = 0; j < lastPolygon.edges[i].length; j++){
            deletePixel(lastPolygon.edges[i][j].x,lastPolygon.edges[i][j].y)
         }
      }
   }
   
   function replace(){
      deletePolygon()
      for(let i = 0; i < lastPolygon.vertices.length; i++){
         lastPolygon.vertices[i].x += -2
         lastPolygon.vertices[i].y += -2
      }
      points = lastPolygon.vertices
      polygon()
   }

   function runScale(e){
      let point = getMousePos(canvas, e);
      scale(point)
   }

   function scale(fixedPoint){
      let x0 = fixedPoint.x
      let y0 = fixedPoint.y
      let scaleX = document.getElementById('xScale').value
      let scaleY = document.getElementById('yScale').value
      matrix = [[scaleX, 0], [0, scaleY]]
      for(let i = 0; i < lastPolygon.vertices.length; i++){
         let newPoint = [0,0]
         newPoint[0] = lastPolygon.vertices[i].x;
         newPoint[1] = lastPolygon.vertices[i].y;
         newPoint[0] -= x0;
         newPoint[1] -= y0;
         newLastPolygon.push(newPoint)
      }

      let scaledCoordinates = math.multiply(newLastPolygon, matrix);

      newLastPolygon = []
      
      scaledCoordinates = math.concat(
        math.add(math.column(scaledCoordinates, 0), x0),
        math.add(math.column(scaledCoordinates, 1), y0),
        1
      );

      for (let i = 0; i < scaledCoordinates.length; i++) {
         let previousPoint = {x: scaledCoordinates[i][0], y: scaledCoordinates[i][1]}
         let nextPoint = {x: scaledCoordinates[(i + 1) % scaledCoordinates.length][0], 
            y: scaledCoordinates[(i + 1) % scaledCoordinates.length][1]}
         points.push(previousPoint)
         points.push(nextPoint)
      }
      deletePolygon()
      polygon()
   }

   function runRotation(e){
      deletePolygon()
      let x0 = lastPolygon.vertices[0].x
      let y0 = lastPolygon.vertices[0].y
      let rotDegree = document.getElementById('rotDegree').value
      rotDegree *= 0.0174533
      matrix = [
         [Math.cos(rotDegree), -Math.sin(rotDegree)],
         [Math.sin(rotDegree),  Math.cos(rotDegree)]
     ];
      for(let i = 0; i < lastPolygon.vertices.length; i++){
         newLastPolygon.push([lastPolygon.vertices[i].x - x0, lastPolygon.vertices[i].y - y0])
      }

      let scaledCoordinates = math.multiply(newLastPolygon, matrix);

      newLastPolygon = []
      
      scaledCoordinates = math.concat(
        math.add(math.column(scaledCoordinates, 0), x0),
        math.add(math.column(scaledCoordinates, 1), y0),
        1
      );

      for (let i = 0; i < scaledCoordinates.length; i++) {
         let previousPoint = {x: Math.round(scaledCoordinates[i][0]), y: Math.round(scaledCoordinates[i][1])}
         let nextPoint = {x: Math.round(scaledCoordinates[(i + 1) % scaledCoordinates.length][0]), 
            y: Math.round(scaledCoordinates[(i + 1) % scaledCoordinates.length][1])}
         points.push(previousPoint)
         points.push(nextPoint)
      }
      polygon();
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
      newPolygon()
      if (markupPoints.length < 1) {
         markupPoints.push(getMousePos(canvas, e));
         drawInitialPixel(markupPoints[0].x, markupPoints[0].y)
      }

      else {
         deletePixel(markupPoints[0].x, markupPoints[0].y)
         markupPoints.push(getMousePos(canvas, e));
         var a = Math.abs(markupPoints[0].x - markupPoints[1].x);
         var b = Math.abs(markupPoints[0].y - markupPoints[1].y);
         var radius = Math.sqrt(a * a + b * b);
         radius = Math.round(radius);

         var x0 = markupPoints[0].x;
         var y0 = markupPoints[1].y;

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
         markupPoints = []
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

   function initializeBoundary(e){
      let mousePos = getMousePos(canvas, e);
      boundaryFill(Math.floor(mousePos.x), Math.floor(mousePos.y));
   }

   function confirmOperation(e){
      if (radio.value == 'Polygon') {
         polygon(e)
      }
      else if(radio.value == 'Curve') {
         curve(e)
      }
      else if(radio.value == 'LineCrop') {
         var i = points.slice(1)
         points = i
         polygon()
      }
   }

   function isPixelPainted(x, y){
      let data = ctx.getImageData(x, y, 1, 1).data
      if (data[3] !== 0) return true
   }

   function exceedsCanvas(x, y){
      return (x <= 159 && y <= 89) && (x >= 0 && y >= 0);
   }

   function boundaryFill(x, y){
      if (!exceedsCanvas(x,y)) return;
      if (!isPixelPainted(x,y)){
         pixel(x, y, 'red');
         boundaryFill(x + 1, y);
         boundaryFill(x -1, y);
         boundaryFill(x, y + 1);
         boundaryFill(x, y - 1);
      }
   }
   
   function crop(e){
      console.log('chegou no crop')
      point = GetWindowMousePos(e)
      points.push(point)
      drawInitialPixel(point.x, point.y) 
      console.log(point)
   }

   function GetWindowMousePos(e){
      console.log('chegou no get')
      const winrect = canvas.getBoundingClientRect()
         var windowEvent = window.event;
         winscaleX = window.width / winrect.width,    // relationship bitmap vs. element for X
         winscaleY = window.height / winrect.height;
         return{
            x: (windowEvent.clientX - winrect.left)*winscaleX, 
            y: (windowEvent.clientY - winrect.top)*winscaleY
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
      else if (radio.value == 'Scanline') {
         canvas.addEventListener("click", scanLine(e))
      }
      else if (radio.value == 'Replace') {
         canvas.addEventListener("click", replace(e))
      }
      else if (radio.value == 'Resize') {
         canvas.addEventListener("click", resize(e))
      }
      else if (radio.value == 'Boundary') {
         canvas.addEventListener("click", initializeBoundary(e))
      }
      else if (radio.value == 'Scale') {
         canvas.addEventListener("click", runScale(e))
      }
      else if (radio.value == 'Rotate') {
         canvas.addEventListener("click", runRotation(e))
      }
   }
   function newHandleFunction(e){
      radio = document.querySelector('input[type=radio]:checked');
      if (radio.value == 'LineCrop') {
         canvas.addEventListener("click", crop(e));
      }
   }
   function clearCanvas(e){
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      points = []
   }
});


