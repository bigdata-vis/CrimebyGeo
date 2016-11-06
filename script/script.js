/**
 * Created by simba on 20/07/2016.
 */
// variable scoping
(function () {
    'use strict';
    var a = window.b = 5;
})();
//console.log(b);

// create native method repeatify to load console.log('hello'.repeatify(3));
String.prototype.repeatify = String.prototype.repeatify || function (times) {
    var str = '';
    for (var i = 0; i < times; i++) {
        str += this + " "
    }
    return str;
};

//console.log('saminu'.repeatify(5));

// Hoisting in javascript function
function saminu() {
    var a, A;
    a = 6;
    A =8;
    function foo() {
        return 6;
    }
    console.log(a);
    console.log(A);
    console.log(foo());
}

//saminu();


// this is javascript
var fullname = 'Saminu Salisu';
var obj = {
    fullname:'Suleiman Salisu',
    prop:{
        fullname:'Isah Yuguda',
        getFullname: function(){
            return this.fullname
        }
    },
    gun: {
        getSettings: function(d){
            d = 1;
            return d + 1
        }
    }
};

//console.log(obj.prop.getFullname());

//test = obj.prop.getFullname;

//console.log(test.call(obj.prop));

//console.log(obj.gun.getSettings(2))
var arrays = [1,4,6,7,8,99,4];

for (var i in arrays){
    console.log(arrays[i])
}


if (1 in arrays){
    console.log("success")
}