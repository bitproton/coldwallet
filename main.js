const {
    app,
    BrowserWindow,
    shell,
    Menu,
    dialog,
    Tray
} = require('electron');


require('electron-context-menu')({
    // showSaveImageAs: true,
    showInspectElement: false
});

let mainWindow;

app.on('ready', () => {
    const screen = require('electron').screen;
    const display = screen.getPrimaryDisplay();
    const area = display.workArea;

    /*
     * Create the main window object
     */
    mainWindow = new BrowserWindow({
        height: area.height,
        width: area.width,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: false,
            devTools: false
        },
        icon: 'icons/png/16x16.png'
    });

    mainWindow.maximize();

    /*
     * Create menus
     */
    const template = [
        {
            role: 'help',
            submenu: [{
                    label: 'About Cold Wallet',
                    click() {
                        dialog.showMessageBox({
                            type: 'none',
                            title: 'About Cold Wallet',
                            message: `BitProton Cold Wallet is an open-source Bitcoin SV for managing private keys and signing transactions offline.

			Use this software on an OFFLINE device for maximum security.

			Source code: https://github.com/bitproton/coldwallet
			
			BitProton © ` + (new Date()).getFullYear()
                        })
                    }
                },
                {
                    label: 'Go to website',
                    click() {
                        shell.openExternal('https://bitproton.com')
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    /*
     * Load content to the main window
     */
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    /*
     * Open links in default browser window
     */
    mainWindow.webContents.on('new-window', function(event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });
});

app.on('window-all-closed', () => {
    app.quit();
})