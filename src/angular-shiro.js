'use strict';

/*
 * globals AuthenticatorProvider, AngularShiroConfigProvider, Subject,
 * UsernamePasswordToken, Authorizer, AuthenticationResponseParser,
 * anonymousFilter, formAuthenticationFilter, logoutFilter, permsFilter,
 * rolesFilter, filtersResolver, hasRoleDirective, notAuthenticatedDirective,
 * authenticatedDirective, lacksRoleDirective, hasAnyRoleDirective,
 * hasPermissionDirective, lacksPermissionDirective, hasAnyPermissionDirective,
 * principalDirective, usernamePasswordFormDirective
 */

var angularShiroServicesModule = angular.module('angularShiro.services', []);
angularShiroServicesModule.provider('authenticator', AuthenticatorProvider);
angularShiroServicesModule.provider('angularShiroConfig', AngularShiroConfigProvider);

angularShiroServicesModule.factory('subject', [ 'authenticator', 'authorizer', 'authenticationResponseParser',
	function(authenticator, authorizer, authenticationResponseParser) {
	    return new Subject(authenticator, authorizer, authenticationResponseParser);
	} ]);
angularShiroServicesModule.factory('usernamePasswordToken', function() {
    return new UsernamePasswordToken();
});
angularShiroServicesModule.factory('authorizer', function() {
    return new Authorizer();
});
angularShiroServicesModule.factory('authenticationResponseParser', function() {
    return new AuthenticationResponseParser();
});

var filters = {
    'anon' : anonymousFilter,
    'authc' : formAuthenticationFilter,
    'logout' : logoutFilter,
    'perms' : permsFilter,
    'roles' : rolesFilter
};

for ( var filterName in filters) {
    angularShiroServicesModule.factory(filterName, filters[filterName]);
}
angularShiroServicesModule.factory('filtersResolver', filtersResolver);

var directives = {
    'hasRole' : hasRoleDirective,
    'notAuthenticated' : notAuthenticatedDirective,
    'authenticated' : authenticatedDirective,
    'lacksRole' : lacksRoleDirective,
    'hasAnyRole' : hasAnyRoleDirective,
    'hasPermission' : hasPermissionDirective,
    'lacksPermission' : lacksPermissionDirective,
    'hasAnyPermission' : hasAnyPermissionDirective,
    'principal' : principalDirective,
    'usernamePasswordForm' : usernamePasswordFormDirective
};

var moduleDirectives = angular.module('angularShiro.directives', []);

for ( var key in directives) {
    moduleDirectives.directive(key, directives[key]);
}

angular.module('angularShiro', [ 'angularShiro.services', 'angularShiro.directives', 'angularShiro.templates']).run(
	function($rootScope, $location, subject, angularShiroConfig, filtersResolver, $log) {

	    var doFilter = function(filtersResolver, $location) {
		var filters = filtersResolver.resolve($location.path());
		for ( var i = 0, len = filters.length; i < len; i++) {
		    if (!filters[i]()) {
			break;
		    }
		}
	    };
	    var visitFilter = function() {
            var url=sessionStorage.getItem(angularShiroConfig.redirctSid);
            if(url!==null){
                sessionStorage.removeItem(angularShiroConfig.redirctSid);
                $location.path(decodeURIComponent(url)).replace();
            }else {
                var mainUrl = $location.path();
                if (mainUrl === "/" || mainUrl === angularShiroConfig.login.path) {
                    $location.path(angularShiroConfig.indexPath).replace();
                } else {
                    doFilter(filtersResolver, $location);
                }
            }
        }
	    $rootScope.$on('$locationChangeStart', function(event, next, current) {
            if (!subject.isAuthenticated()) {
                var state=subject.restoreAuth(angularShiroConfig);
                if(state) {
                    visitFilter();
                }else{
                    try {
                        var output = subject.rememberMe(angularShiroConfig.remeberSid);
                        if (output !== false) {
                            output.then(function () {
                                visitFilter();
                            });
                        } else {
                            //��¼��ת��Ϣ����Ϣ��¼��Session
                            var curUrl=$location.path();
                            if(!(curUrl==="/"||curUrl=== angularShiroConfig.login.path)){
                                sessionStorage.setItem(angularShiroConfig.redirctSid, encodeURIComponent($location.url()));
                            }
                            $location.path(angularShiroConfig.login.path).replace();
                        }
                    } catch (e) {
                        $log.error(e.message);
                        $location.path(angularShiroConfig.login.path).replace();
                    }
                }
            } else{
                visitFilter();
            }
	    });
	});
/**
 * Return the DOM siblings between the first and last node in the given array.
 * 
 * @param {Array}
 *                array like object
 * @returns jQlite object containing the elements
 */
function getBlockElements(nodes) {
    var startNode = nodes[0], endNode = nodes[nodes.length - 1];
    if (startNode === endNode) {
	return angular.element(startNode);
    }

    var element = startNode;
    var elements = [ element ];

    do {
	element = element.nextSibling;
	if (!element)
	    break;
	elements.push(element);
    } while (element !== endNode);

    return angular.element(elements);
}

var trim = (function() {
    if (!String.prototype.trim) {
	return function(value) {
	    return angular.isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
	};
    }
    return function(value) {
	return angular.isString(value) ? value.trim() : value;
    };
})();
