define(
    [
        'js/Organizator/Organizator/Application',
        'js/Organizator/Apps/QRCodeWebcamScanner/QRCodeWebcamScanner',
        'js/node_modules/bitcoincashjs-lib/dist/bitcoincashjs-lib.min',
        'js/node_modules/qrious/dist/qrious.min',
        'js/node_modules/jsqr/dist/jsQR',
        'text!./Resources/view/qrcode-modal.html.njk',
        'text!./Resources/view/qrcode-scanner-modal.html.njk',
        'text!./Resources/view/json-modal.html.njk',
        'css!./Resources/css/style'
    ],
    function(
        Organizator_Application,
        QRCodeWebcamScanner,
        bitcoinjs,
        QRious,
        jsQR,
        tpl_qrCodeModal,
        tpl_qrCodeScannerModal,
        tpl_jsonModal
    ){
        class TextareaTools extends Organizator_Application {
            constructor(){
                super('TextareaTools');
            }

            textareaActionButtonClicked(event){
                var self = this;

                let element = event.currentTarget;
                let command = element.getAttribute('data-cmd');
                let actionButtons = element.parents('.actionButtons')[0];
                let input = document.querySelector('#' + actionButtons.getAttribute('for'));
                let formGroup = input.parents('.js__formGroup')[0];
                let label = formGroup.querySelector('label').innerHTML;

                switch(command){
                    case 'copy':
                        input.select();
                        document.execCommand('copy');

                        element.innerHTML = 'copied!';

                        setTimeout(function(){
                            element.innerHTML = 'copy';
                        }, 2000);
                        break;
                    case 'toqrcode':
                        var content = Organizator.Nunjucks.renderString(tpl_qrCodeModal, {
                            label: label,
                            input: input
                        });
                        var modal = Organizator.applications.ModalManager.new({
                            content: content,
                            closeOnOverlayClick: true
                        });

                        var qrElement = modal.element.querySelector('.qrCode');

                        var qrcode = new QRious({
                          element: qrElement,
                          value: input.value,
                          size: 400
                        });

                        modal.show();
                        break;
                    case 'importtxt':
                        var fileinputElement = document.createElement('input');
                        fileinputElement.setAttribute('type', 'file');

                        var reader = new FileReader();

                        reader.onload = function(e) {
                            input.value = reader.result;
                            input.dispatchEvent(new Event('input'));
                        }
                        
                        fileinputElement.addEventListener('change', function(event){
                            var file = fileinputElement.files[0];

                            reader.readAsText(file);
                        });

                        fileinputElement.click();
                        break;
                    case 'importqrcode':
                        var fileinputElement = document.createElement('input');
                        fileinputElement.setAttribute('type', 'file');

                        var reader = new FileReader();

                        reader.onload = function(e) {
                            var image = new Image;
                            image.src = e.target.result;
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext("2d");

                            image.onload = function(){
                                ctx.canvas.width = image.width;
                                ctx.canvas.height = image.height;
                                ctx.drawImage(image, 0, 0, image.width, image.height);

                                var imageData = ctx.getImageData(0, 0, image.width, image.height);
                                var result = jsQR(imageData.data, image.width, image.height);

                                if(result){
                                    input.value = result.data;
                                }else{
                                    input.value = 'Decode failed.';
                                }

                                input.dispatchEvent(new Event('input'));
                            }
                        }
                        
                        fileinputElement.addEventListener('change', function(event){
                            var file = fileinputElement.files[0];
                            reader.readAsDataURL(file);
                        });

                        fileinputElement.click();
                        break;
                    case 'scanqrcode':
                        var content = Organizator.Nunjucks.renderString(tpl_qrCodeScannerModal, {
                            label: label
                        });

                        var modal = Organizator.applications.ModalManager.new({
                            content: content,
                            closeOnOverlayClick: true,
                        });

                        var qrCodeScannerCanvas = modal.element.querySelector('canvas.qrCodeScanner');
                        var qrCodeWebcamScanner = new QRCodeWebcamScanner({
                            canvas: qrCodeScannerCanvas,
                            threshold: 3
                        });

                        modal.onbeforeclose = function(){
                            qrCodeWebcamScanner.stop.call(qrCodeWebcamScanner);

                            return true;
                        };

                        qrCodeWebcamScanner.onsuccess = (function(data){
                            input.value = data;
                            Organizator.applications.ModalManager.remove(modal);
                            input.dispatchEvent(new Event('input'));
                        }).bind(this);

                        modal.show();
                        qrCodeWebcamScanner.request();
                        break;
                    case 'txbodytotxt':
                        var blob = new Blob([input.value], {type:'text/plain'});
                        var filename = 'tx-body_' + Math.round((new Date().getTime()) / 1000);
                        var a = document.createElement('a');

                        a.href = window.URL.createObjectURL(blob);
                        a.setAttribute('download', filename);
                        a.style.display = 'none';
                        a.click();

                        break;
                    case 'txmetatotxt':
                        var blob = new Blob([input.value], {type:'text/plain'});
                        var filename = 'tx-meta_' + Math.round((new Date().getTime()) / 1000);
                        var a = document.createElement('a');

                        a.href = window.URL.createObjectURL(blob);
                        a.setAttribute('download', filename);
                        a.style.display = 'none';
                        a.click();

                        break;
                    case 'txbodytojson':
                        var tx = new bitcoinjs.Transaction.fromHex(input.value);
                        var content = Organizator.Nunjucks.renderString(tpl_jsonModal, {
                            label: label,
                            value: JSON.stringify(Organizator.applications.TxViewer.decodeToBitcoindAwareFormat(tx), null, '  ')
                        });
                        var modal = Organizator.applications.ModalManager.new({
                            content: content,
                            closeOnOverlayClick: true
                        });

                        modal.show();

                        var textareaElement = modal.element.querySelector('textarea');
                        textareaElement.style.height = (textareaElement.scrollHeight + textareaElement.offsetHeight - textareaElement.clientHeight ) + 'px';
                        break;
                    case 'txmetatojson':
                        var content = Organizator.Nunjucks.renderString(tpl_jsonModal, {
                            label: label,
                            value: JSON.stringify(JSON.parse(Organizator.applications.TxViewer.hexToString(input.value)), null, '  ')
                        });
                        var modal = Organizator.applications.ModalManager.new({
                            content: content,
                            closeOnOverlayClick: true
                        });

                        modal.show();

                        var textareaElement = modal.element.querySelector('textarea');
                        textareaElement.style.height = (textareaElement.scrollHeight + textareaElement.offsetHeight - textareaElement.clientHeight ) + 'px';
                        break;
                }
            }
        }
        
        return TextareaTools;
    }
);