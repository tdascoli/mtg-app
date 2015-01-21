//=== alv-ch-ng common
//

/*jshint unused:false */
function RoutingConfigurator(){
    this.configure=function(model,$routeProvider){
        for(var i=0;i<model.length;i++){
            configureRecursively(model[i],$routeProvider);
        }
    };

    var configureRecursively=function(item,$routeProvider){
        if (!item.controller){
            $routeProvider.when(item.location, {templateUrl: item.templateUrl});
        }
        else {
            $routeProvider.when(item.location, {controller: item.controller, templateUrl: item.templateUrl});
        }

        if (item.children && item.children.length>0){
            for(var i=0;i<item.children.length;i++){
                configureRecursively(item.children[i],$routeProvider);
            }
        }
    };
}