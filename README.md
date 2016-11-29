# A Simple Javascript Plugin To Validate HTML Form

We just need to add 'data-validate' attribute to our <form> tag.

We can use configuration, just like:
```
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
    //typeMismatchMessage: message

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
  ```
