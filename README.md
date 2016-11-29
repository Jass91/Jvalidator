# A Simple Javascript Plugin To Validate HTML Form

We just need to add 'data-validate' attribute to our 'form' tag, or pass an array of 'formId' to our jvalidator.

We can call our validation:
 ```javascript
 // *** Initialize our validator and makes de magic :) *** //

  // You can set validation to a list of forms
  //jvalidator.validateUsingThisConfig(config, ["#form"]);

  // You can set validation to forms that apply 'data-validate' attribute
  jvalidator.validateUsingThisConfig(config);

  // You can use default configuration calling:
  //jvalidator.validateUsingDefaultConfig(["#form"]);

  // or calling:
  //jvalidator.validateUsingDefaultConfig();
  ```

We can use configuration, just like:
```javascript
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
In html, if you want to use custom validation, just do it:
```html
<input type="text" id="customInput" data-validate-using="myCustonValidationFunc" />
```
