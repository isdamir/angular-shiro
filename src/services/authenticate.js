'use strict';

/**
 * @ngdoc service
 * @name angularShiro.services.Authenticator
 * @requires $q
 * @requires $http
 * @requires $$timeout
 * @requires angularShiro.services.AngularShiroConfig
 * 
 * @description Service in charge of the authentication process.
 * 
 * Default implementation send a `post` request to the uri specified in the
 * <code>AngularShiroConfig</code> through the <code>login.api</code>
 * property value.
 * 
 * <span class=" alert-danger">This service is not intended to be accessed
 * directly; It's meant to be used internally by the `subject` service.</span>
 * 
 */
function AuthenticatorProvider() {

    this.$get = [
	    '$q',
	    '$http',
	    '$timeout',
	    'angularShiroConfig',
	    function($q, $http, $timeout, config) {
		return {
		    /**
		     * @ngdoc method
		     * @name authenticator#authenticate
		     * @param {UsernamePasswordToken}
		     *                token authentication token
		     * @methodOf angularShiro.services.Authenticator
		     * @returns {Promise} Returns a promise
		     */
		    authenticate : function(token) {
			var promise = null;
			if (!token || !token.getPrincipal() || !token.getCredentials()) {
			    throw '[Autheticate] Can not authenticate. Invalid token provided!';
			}
			if (config && config.login && config.login.api) {
			    var deferred = $q.defer();
			    var sharioConfig=config;
			    $http.post(config.login.api, {
				token : {
				    principal : token.getPrincipal(),
				    credentials : token.getCredentials()
				}
			    }).success(function(data, status, headers) {
				deferred.resolve([data,status,headers,sharioConfig]);
			    }).error(function(data, status, headers) {
				deferred.reject([data,status,headers,sharioConfig]);
			    });
			    promise = deferred.promise;
			} else {
			    throw '[Autheticate] Can not authenticate since no \'config.login.api\' is provided. Please check your configuration.';
			}
			return promise;
		    }

		};
	    } ];

}

/**
 * @ngdoc object
 * @name angularShiro.services.UsernamePasswordToken
 * 
 * @description <code>UsernamePasswordToken</code> is a simple
 *              username/password authentication token.
 * 
 * @since 0.0.1
 */
function UsernamePasswordToken(username, password, rememberMe) {
    /**
     * @ngdoc property
     * @name UsernamePasswordToken#username
     * @propertyOf angularShiro.services.UsernamePasswordToken
     * @description the Subject's user name
     */
    this.username = username || null;
    /**
     * @ngdoc property
     * @name UsernamePasswordToken#password
     * @propertyOf angularShiro.services.UsernamePasswordToken
     * @description the Subject's password
     */
    this.password = password || null;

    /**
     * @ngdoc property
     * @name UsernamePasswordToken#rememberMe
     * @propertyOf angularShiro.services.UsernamePasswordToken
     * @description Whether or not 'rememberMe' should be enabled for the
     *              corresponding login attempt; default is `false`
     */
    this.rememberMe = rememberMe || false;

    /**
     * @ngdoc method
     * @name UsernamePasswordToken#getPrincipal
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description Returns <code>username</code> value
     * @return {string} <code>username</code> value
     */
    this.getPrincipal = function() {
	return this.username;
    };

    /**
     * @ngdoc method
     * @name UsernamePasswordToken#getCredentials
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description Returns the <code>password</code> value
     * 
     * @return {string} <code>password</code> value
     */
    this.getCredentials = function() {
	return this.password;
    };

    /**
     * @ngdoc method
     * @name UsernamePasswordToken#isRememberMe
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * 
     * @description Returns `true` if the `Subject` is to be remembered, i.e if
     *              the credentials should be stored in the browser
     *              `sessionStorage`, `false` otherwise (`false` by default)
     * 
     * @return {boolean} `true` if the `Subject` is to be remembered, i.e if the
     *         credentials should be stored in the browser `sessionStorage`,
     *         `false` otherwise (`false` by default)
     */
    this.isRememberMe = function() {
	return this.rememberMe;
    };

    /**
     * 
     * @ngdoc method
     * @name UsernamePasswordToken#setRememberMe
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description If set to `true`, in cas of page reload, if a valid session
     *              corresponding to the url `sessionId` param is found, use the
     *              serialiazed token to auto login to reload authorizations
     * 
     * @param {boolean}
     *                rememberMe value
     */
    this.setRememberMe = function(rememberMe) {
	this.rememberMe = rememberMe;
    };

    /**
     * @ngdoc method
     * @name UsernamePasswordToken#clear
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description Clear all the data
     * 
     */
    this.clear = function() {
	this.username = this.password = null;
	this.rememberMe = false;
    };
    /**
     * @ngdoc method
     * @name UsernamePasswordToken#serialize
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description Clear all the data
     * 
     * @return {string} the current token serialized as a json string
     */
    this.serialize = function() {
	return angular.toJson(this);
    };
    /**
     * @ngdoc method
     * @name UsernamePasswordToken#deserialize
     * @methodOf angularShiro.services.UsernamePasswordToken
     * 
     * @description Deserialize the json string representing the token and copy
     *              the value to the current object
     * 
     * @param {string}
     *                serializedToken json string representing the token
     */
    this.deserialize = function(serializedToken) {
	var obj = angular.fromJson(serializedToken);
	angular.extend(this, obj);
    };

}

/**
 * @ngdoc object
 * @name angularShiro.services.AuthenticationInfo
 * 
 * @description <code>AuthenticationInfo</code> represents the Subject's
 *              informations regarding the authentication process
 * 
 * @param {string}
 *                principal Subject's principal (ex : Subject's login, username,
 *                ...)
 * 
 * @param {string}
 *                credentials Subject's principal (ex : Subject's login,
 *                username, ...)
 * 
 * @since 0.0.1
 */
function AuthenticationInfo(principal, credentials) {
    
    
    /**
     * @name AuthenticationInfo#principal
     * @propertyOf angularShiro.services.AuthenticationInfo
     * @description the Subject's principal
     * @returns {string} the Subject's principal
     */
    this.principal = principal;
    /**
     * @name AuthenticationInfo#username
     * @propertyOf angularShiro.services.AuthenticationInfo
     * @description the Subject's credentials
     * @returns {object} the Subject's credentials
     */
    this.credentials = credentials;
    
    /**
     * @ngdoc method
     * @name AuthenticationInfo#getCredentials
     * @methodOf angularShiro.services.AuthenticationInfo
     * 
     * @description Returns the Suject's principal
     * 
     * @return {object} the Subject's principal
     * @since 0.0.1
     */
    this.getPrincipal = function() {
	return this.principal;
    };

    /**
     * @ngdoc method
     * @name AuthenticationInfo#getCredentials
     * @methodOf angularShiro.services.AuthenticationInfo
     * 
     * @description Returns the Subject's credentials . A credential verifies
     *              the Subject's principal, such as a password or private key
     * 
     * @returns {object} the Subject's credentials
     * @since 0.0.1
     */
    this.getCredentials = function() {
	return this.credentials;
    };

}

/**
 * @ngdoc object
 * @name angularShiro.services.AuthenticationResponseParser
 * 
 * @description `AuthenticationResponseParser` is responsible of validating then
 *              parsing the response received from the authentication service
 *              backend
 * 
 * #Response
 * 
 * The response returned from the backend have to be a `json` object that comply
 * to the following structure :
 * 
 * <pre>
 * {
 *     info : {
 * 	authc : {
 * 	    principal : {
 * 		// the Suject/User principal, for example
 * 		&quot;login&quot; : &quot;edegas&quot;,
 * 		&quot;apiKey&quot; : &quot;*******&quot;
 * 	    },
 * 	    credentials : {
 * 		// the Subject/User credentials, for example
 * 		&quot;name&quot; : &quot;Edgar Degas&quot;,
 * 		&quot;email&quot; : &quot;degas@mail.com&quot;
 * 	    }
 * 	},
 * 	authz : {
 * 	    // list of the Subject/User roles, for example
 * 	    roles : [ &quot;GUEST&quot; ],
 * 	    // list of the Subject/User permissions, for example
 * 	    permissions : [ &quot;newsletter$read&quot;, &quot;book$*&quot; ]
 * 	}
 *     }
 * }
 * </pre>
 * 
 * @since 0.0.1
 */
function AuthenticationResponseParser() {

    /**
     * 
     * @ngdoc method
     * @function
     * @name AuthenticationResponseParser#parse
     * @methodOf angularShiro.services.AuthenticationResponseParser
     * 
     * @description Validates then parse the data received from the backend
     *              authentication service
     * 
     * @param {Object}
     *                data the token encapsulating the subject's principals and
     *                credentials to be passed to the Authentication subsystem
     *                for verification.
     * 
     * @returns {object} the parsed data
     * 
     */
    this.parse = function(data) {
	this.checkValidity(data);
	return {
	    authc : this.parseAuthc(data.info.authc),
	    authz : this.parseAuthz(data.info.authz)
	};
    };

    this.parseAuthc = function(authc) {
	return new AuthenticationInfo(authc.principal, authc.credentials);
    };

    this.parseAuthz = function(authz) {
	return new AuthorizationInfo(authz.roles, authz.permissions);
    };

    /**
     * 
     */
    this.checkValidity = function(data) {
	if (!angular.isDefined(data) || !angular.isDefined(data.info) || !this.isAuthcValid(data.info)
		|| !this.isAuthzValid(data.info)) {
	    var msg = 'Response does not match expected structure.';
	    throw {
		'name' : 'ParseException',
		'message' : msg
	    };
	}
    };

    this.isAuthcValid = function(info) {
	var valid = angular.isDefined(info.authc);
	if (valid) {
	    var authc = info.authc;
	    valid = angular.isDefined(authc.principal) && angular.isDefined(authc.credentials);
	}
	return valid;
    };

    this.isAuthzValid = function(info) {
	var valid = angular.isDefined(info.authz);
	if (valid) {
	    var authz = info.authz;
	    valid = angular.isDefined(authz.roles) && angular.isDefined(authz.permissions);
	}
	return valid;
    };
}