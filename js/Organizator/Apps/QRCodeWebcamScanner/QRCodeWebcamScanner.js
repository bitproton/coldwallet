define(
    [
        'js/node_modules/jsqr/dist/jsQR'
    ],
    function(
        jsQR
    ){
        class QRCodeWebcamScanner {
            constructor(options){
                this.video = document.createElement('video');
                this.video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
                this.results = [];
                this.threshold = 0;

                Object.assign(this, options);

                if(typeof this.canvas !== 'undefined'){
                    this.ctx = this.canvas.getContext('2d');
                }
            }

            setElements(canvas){
                this.canvas = canvas;
                this.ctx = this.canvas.getContext('2d');
            }

            request(){
                navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(this.play.bind(this));
            }

            play(stream){
                this.video.srcObject = stream;
                this.video.play();
                this.stream = stream;

                this.canvas.width = 640;
                this.canvas.height = 480;

                this.requestID = requestAnimationFrame(this.tick.bind(this));
            }

            stop(){
                if(typeof this.stream !== 'undefined'){
                    this.stream.getTracks()[0].stop();
                    
                    cancelAnimationFrame(this.requestID);
                }
            }

            tick() {
                if(this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                   this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

                    var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    var code = jsQR(imageData.data, imageData.width, imageData.height);

                    if(code){
                        this.drawLine.call(this, code.location.topLeftCorner, code.location.topRightCorner, "#c91400");
                        this.drawLine.call(this, code.location.topRightCorner, code.location.bottomRightCorner, "#c91400");
                        this.drawLine.call(this, code.location.bottomRightCorner, code.location.bottomLeftCorner, "#c91400");
                        this.drawLine.call(this, code.location.bottomLeftCorner, code.location.topLeftCorner, "#c91400");

                        if(typeof this.onsuccess === 'function'){
                            let foundBefore = this.results.filter(function(item){return item == code.data;});

                            if(foundBefore.length > this.threshold){
                                this.results = [];
                                this.onsuccess(code.data);

                                return;
                            }else{
                                this.results.push(code.data);
                            }
                        }
                    }
                }

                this.requestID = requestAnimationFrame(this.tick.bind(this));
            }

            drawLine(begin, end, color){
              this.ctx.beginPath();
              this.ctx.moveTo(begin.x, begin.y);
              this.ctx.lineTo(end.x, end.y);
              this.ctx.lineWidth = 3;
              this.ctx.strokeStyle = color;
              this.ctx.stroke();
            }
        }
        
        return QRCodeWebcamScanner;
    }
);