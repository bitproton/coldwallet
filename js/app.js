require(
	[
		'js/Organizator/Organizator'
	],
	function(
		Organizator
	){
		require(
			[
			    'route!js/Organizator/Resources/routes',
			    'controller!js/Organizator/Resources/controllers'
			],
			function(
				routes,
				controllers
			){
				require(
					[
						'js/Organizator/Apps/MyApp/MyApp',
						'js/Organizator/Apps/ModalManager/ModalManager',
						'js/Organizator/Apps/TextareaTools/TextareaTools',
						'js/Organizator/Apps/Wallet/Wallet',
						'js/Organizator/Apps/Auth/Auth',
        				'js/Organizator/Apps/TxViewer/TxViewer',
        				'js/node_modules/sjcl/sjcl'
					],
					function(
						MyApp,
						ModalManager,
						TextareaTools,
						Wallet,
						Auth,
						TxViewer
					){
						new MyApp();
						new ModalManager();
						new TextareaTools();
						new Wallet();
						new Auth();
						new TxViewer();
					}
				);
			}
		);
	}
);