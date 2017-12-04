(function() {

	this.gitChecked = function() {

		this.element = document.getElementById('release-check');
		this.app	 = document.getElementById('app-version');
		this.current = document.getElementById('latest-release');
		this.gitPath = null;
		this.release = {};

		var defaults = {

			version: 	'1.0.0',
			gitURL: 	'https://api.github.com/repos',
			gitOwner:	'keisermedia',
			gitRepo:	'ipc-toolbox',


		}


		if( arguments[0] && typeof arguments[0] === 'object' )
			this.options = extendDefaults( defaults, arguments[0] );

		this.app.innerText = this.options.version;
		this.current.innerText = 'Checking';
		this.current.className += 'loading';

		this.getVersion = function() {

			return this.options.version;

		}

		this.latest = function() {

			this.gitPath = this.options.gitURL + '/' + this.options.gitOwner + '/' + this.options.gitRepo;
			version = this.options.version

			$.ajax({

				url:	this.gitPath + '/releases/latest',
				type:	'GET',
				success: function( data ) {

					return check_release( data, version );

				},
				error: function( xhr, ajaxOptions, thrownError ) {

					if( 404 == xhr.status)
						alert(thrownError);
				}

			});

		}

	}

	function check_release( data, version ) {

		var current = document.getElementById('latest-release');
console.log(Object.keys(data).length);
		if( empty(Object.keys(data).length) || ( 0 === Object.keys(data).length && data.constructor === Object ) )
			return current.innerText ='Release information not available.';

		if( isSemVer( version, data.tag_name ) )
			return current.innerText = data.tag_name;

		if( isSemVer( version, '< ' + data.tag_name ) ) {

			var link = document.createElement('a');

			link.appendChild( document.createTextNode(data.tag_name) );
			link.href		= data.zipball_url;
			link.target 	= '_blank';

			alert('Do NOT continue to use this version. There is a new version of the IPC Toolbox.');

			current.innerText = '';

			return current.appendChild(link);
		}
	}

	function extendDefaults( source, properties ) {

		var property;

		for( property in properties ) {

			if( properties.hasOwnProperty(property) )
				source[property] = properties[property];

		}

		return source;

	}

}());
