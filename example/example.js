// custom function to validate first input
var myCustonValidationFunc = function(element){
  var value = element.value;
  return value == 'let me pass brow';
};

var submitFunc = function(){
  alert("Form was received with success");
};

// assig submit event to be executed after validation
var assignSubmitEvent = function(){
  $('#form').on('submit', submitFunc);
};

// get our config object
var getConfigurationToJvalidator = function(){

  var config = {

    // our custom message when 'required' validation fails
    valueMissingMessage: "You must enter some value brow",
    //badValueMessage: message,
    //patternMismatchMessage: message,
    //rangeOverflowMessage: message,
    //rangeUnderflowMessage: message,
    //stepMismatchMessage: message,
    //tooLongMessage: message,
    //tooShortMessage: message,
    //typeMismatchMessage: message,
    fieldsDoesNotMatchMessage: "Os campos não conferem",

    /*
    inputErrorClass: {
      border: value,
      color: value
    },
    */

    /*
    messageErrorClass: {
      border: value,
      color: value
    },
    */

    // does not validate on blur
    //preventValidationOnBlur: true,

    // tell wich event will be used to validate some fields
    validateOn: [
      {
        event: "keyup",
        fields: ["#customInput"]
      },
      {
        event: "blur",
        fields: ["#inputToDisable"]
      }
    ],

    // specify some custom validations
    customValidations: [
      {
       key: "myCustonValidationFunc", // this key is used on 'data-validate-using' attribute
       validate: myCustonValidationFunc,
       customInvalidMessage: "you must enter 'let me pass brow'"
      }
    ],

    // disable some components ('#inputToDisable') when '#customInput' validation fails
    disableRules: [
      {
       whenErrorIn: "#customInput",
       disableFields: ["#inputToDisable"],
       //callFunction: value (this not exist yet =/ )
      }
    ]

  };

  return config;
};

// start our plugin
$(document).ready(function() {

  // assign evento to submit
  assignSubmitEvent();

  // *** Initialize our validator and makes de magic :) *** //

  // You can set validation to a list of forms
  //jvalidator.validateUsingThisConfig(config, ["#form"]);

  // You can set validation to forms that apply 'data-validate' attribute
  jvalidator.validateUsingThisConfig(getConfigurationToJvalidator());

  // You can use default configuration calling:
  //jvalidator.validateUsingDefaultConfig(["#form"]);

  // or calling:
  //jvalidator.validateUsingDefaultConfig();

});
