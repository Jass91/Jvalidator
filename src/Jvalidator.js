'use strict';

// our global variable to hold our plugin
var jvalidator = (function () {

  // this is our plugin
  var Jvalidator = function(){

    // globals
    var self = this;
    var formCollection = {};

    // put default style back
    var unapplyErrorClassOn = function(element){
      $(element).removeAttr("style");
    };

    // apply some style
    var applyErrorClassOn = function(element){

      // apply user custom error class
      if(self.config.onInputErrorClass){
        $(element).addClass(onInputErrorClass);

        // apply default error class
      }else{

        $(element).css({
          "box-shadow": "0 0 5px 1px red"
          //'border-color': "red"
        });
      }

    };

    var disableSubmitOnForm = function($form, value){
      var i = 0;
      var $components = $form.find(":input[type='submit']", ":button[type='submit']");
      while($components[i]){
        var $component = $($components[i]);
        $component.attr("disabled", value);
        i++;
      }
    };

    var enableComponentsBasedOn = function(element){
      // enable components base on user preferences
      if(self.config.disableRules){
        self.config.disableRules.forEach(function(rule){
          if($(rule.whenErrorIn).is(element)){
            rule.disableFields.forEach(function(fieldId){
              $(fieldId).attr("disabled", false);
            });
          }

        });
      }
    };

    var disableComponentsBasedOn = function(element){

      // disable components base on user preferences
      if(self.config.disableRules){
        self.config.disableRules.forEach(function(rule){

          if($(rule.whenErrorIn).is(element)){
            rule.disableFields.forEach(function(fieldId){
              $(fieldId).attr("disabled", true);
            });
          }

        });
      }
    }

    var showErrorMessageNear = function(element, msg){
      var $element = $(element).next("div[data-error-message]");
      $element.html(msg);
      $element.show();
    };

    var clearErrorMessageNear = function(element){
      var $element = $(element).next("div[data-error-message]");
      $element.html("");
      $element.hide();
    };

    // execute actions when error
    var applyErrorAction = function($form, element, msg){
      applyErrorClassOn(element);
      disableComponentsBasedOn(element);
      showErrorMessageNear(element, msg);
    };

    // undo actions did on error
    var unapplyErrorAction = function($form, element){
      unapplyErrorClassOn(element);
      enableComponentsBasedOn(element);
      clearErrorMessageNear(element);
    };

    var createAdjacentElementTo = function(element){

      var $divToErrorMessage = $("<div hidden data-error-message></div>");
      if(self.config.messageErrorClass){
        $divToErrorMessage.addClass(config.messageErrorClass);
      }else{
        $divToErrorMessage.css({"color": "red"});
      }

      $(element).after($divToErrorMessage);

    };

    var matchValidate = function(attrValue, element){
      var fieldToMatch = attrValue.substring(attrValue.indexOf("(")+ 1, attrValue.indexOf(")"));

      var fieldToMatchValue = $(element).val();
      var fieldToTestValue = $(fieldToMatch).val();

      // if there is no handler in our config object
      if(fieldToMatchValue != fieldToTestValue){
        return self.config.fieldsDoesNotMatchMessage;
      }else{
        return "valid";
      }

    };

    var useValidate = function(attrValue, element){

      var customFuncName = attrValue.substring(attrValue.indexOf("(")+ 1, attrValue.indexOf(")"));

      // get on config object the rule applied to our input by 'data-validate-using' attribute
      var validationRule = self.config.customValidations.find(function(rule){
        return rule.key == customFuncName;
      });

      // if there is no handler in our config object
      if(!validationRule){
        throw "key '" + customFuncName + "' passed to attribute 'data-validate-use' not found on config object";
      }else if(!$.isFunction(validationRule.validate)){
        throw 'you must pass a function as value';
      }

      // call custom function
      if(validationRule.validate(element)){
        return "valid";
      }else{
        return validationRule.customInvalidMessage;
      }

    };

    var validateField = function(element){

      var msg = "";
      var hasError = false;
      var extendedValidationValue = $(element).attr("data-extended-validation");

      // check for html5 native validations
      if(element.checkValidity() ==  false){

        hasError = true;

        if (element.validity.patternMismatch) {
          msg = self.config.patternMismatchMessage ? self.config.patternMismatchMessage : element.validationMessage;
        }
        else if (element.validity.rangeOverflow) {
          msg = self.config.rangeOverflowMessage ? self.config.rangeOverflowMessage : element.validationMessage;
        }
        else if (element.validity.rangeUnderflow) {
          msg = self.config.rangeUnderflowMessage ? self.config.rangeUnderflowMessage : element.validationMessage;
        }
        else if (element.validity.stepMismatch) {
          msg = self.config.stepMismatchMessage ? self.config.stepMismatchMessage : element.validationMessage;
        }
        else if (element.validity.tooLong) {
          msg = self.config.tooLongMessage ? self.config.tooLongMessage : element.validationMessage;
        }
        else if (element.validity.tooShort) {
          msg = self.config.tooShortMessage ? self.config.tooShortMessage : element.validationMessage;
        }
        else if (element.validity.typeMismatch) {
          msg = self.config.typeMismatchMessage ? self.config.typeMismatchMessage : element.validationMessage;
        }
        else if (element.validity.valueMissing) {
          msg = self.config.valueMissingMessage ? self.config.valueMissingMessage : element.validationMessage;
        }
        else if (element.validity.badValue) {
          msg = self.config.badValueMessage ? self.config.badValueMessage : element.validationMessage;
        }

      }

      // extra validations provided by Jvalidator
      else if(extendedValidationValue){
        if(extendedValidationValue.startsWith("match(")){
          var status = matchValidate(extendedValidationValue, element);
          if(status != "valid"){
            hasError = true;
            msg = status;
          }
        }else if(extendedValidationValue.startsWith('use(')){
          var status = useValidate(extendedValidationValue, element);
          if(status != "valid"){
            hasError = true;
            msg = status;
          }
        }else{
          throw extendedValidationValue + " not supported on 'data-extended-validation' attribute";
        }
      }

      return {
        hasError: hasError,
        message: msg
      };

    };

    var validateForm = function(event, $form){

      var i = 0;
      var msg = "";
      var isValid = true;
      var formInfo = getFormInfo($form);

      // we don`t want to submit form
      if(event.type == 'submit'){
        event.preventDefault();

        // for each field on form, chech it state
        for(var p in formInfo){
          if(p == 'state'){
            continue;
          }

          var control = $("*[jControlId='" + p + "']")[0];
          var controlState = validateField(control);

          if(controlState.hasError){
            msg = controlState.message;
            isValid = false;
            applyErrorAction($form, control, msg);
          }else{
            unapplyErrorAction($form, control);
          }
        }

        // validate when event was triggered by an input
      }else{
        var control = event.target;
        var controlState = validateField(control);
        if(controlState.hasError){
          msg = controlState.message;
          isValid = false;
          applyErrorAction($form, control, msg);
        }else{
          unapplyErrorAction($form, control);
        }
      }

      if(!isValid){
        //disableSubmitOnForm($form, true);
        event.stopPropagation();
        event.stopImmediatePropagation();
      }else{
        //disableSubmitOnForm($form, false);
      }

    };

    var setup = function($forms){

      var i = 0;

      while($forms[i]){

        var j = 0;
        var $form = $($forms[i]);

        disableValidationOnForm($form);

        bindValidationToFormSubmit($form);

        var artificialFormId = createAndSetFormArtificialId($form, i);

        // we will extend it
        formCollection[artificialFormId] = {
          state: 'initial'
        };

        // get child components
        var $components = $form.find(":input[type!='submit']", ":textarea", ":select");
        while($components[j]){

          var $component = $($components[j]);

          var artificialControlId = createAndSetControlArtificialId($component , j);
          formCollection[artificialFormId][artificialControlId] = {
            state: 'initial'
          }

          // create a place to show our error messages near the component
          createAdjacentElementTo($component);

          // if user needs something different
          if(self.config.validateOn){

            // for each rule
            var rule = self.config.validateOn.find(function(rule){

              // for each field in this rule
              var field = rule.fields.find(function(elementId){
                return ("#" + $component.attr("id")) == elementId;
              });

              if(field){
                return true;
              }else{
                return false;
              }

            });

            // we always apply blur validation, except if user cancel this
            if(!self.config.preventValidationOnBlur)
            bindValidationToField($component, $form, 'blur');

            // if we found rule for this $component
            if(rule && rule.event != 'blur'){
              bindValidationToField($component, $form, rule.event);

              // else, we apply default behavior
            }else{

              // by default we aplly validation on keyup to text input
              if($component.is("input[type='text'") || $component.is("textarea")){
                //bindValidationToField($component, $form, "keyup");
                bindValidationToField($component, $form, "input");

                // and apply validation on 'change' to remaining controllers
              }else{
                bindValidationToField($component, $form, "change");
              }

            }

            // default behavior
          }else{

            // by default we aplly validation on keyup to text input
            if($component.is("input[type='text'") || $component.is("textarea")){
              //bindValidationToField($component, $form, "keyup");
              bindValidationToField($component, $form, "input");

              // and apply validation on 'change' to remaining controllers
            }else{
              bindValidationToField($component, $form, "change");
            }
          }


          j++;

        }

        i++;

      }
    };

    // an artifical id to find our forms
    var createAndSetFormArtificialId = function($form, index){
      var c = $form.attr("jFormId", "jFormId" + index);
      return c.attr("jFormId");
    };

    var createAndSetControlArtificialId = function($control, index){
      var c = $control.attr("jControlId", "jControlId" + index);
      return c.attr("jControlId");
    };

    var getFormInfo = function($form){
      var jFormId = $form.attr("jFormId");
      var formInfo = formCollection[jFormId];
      return formInfo;
    };

    var updateFormCollection = function($form, element, state){
      var jFormId = $form.attr("jFormId");
      var jControlId = $(element).attr("jControlId");

      // update control state
      formCollection[jFormId][jControlId].state = state;

      // update form state
      if(state == "invalid"){
        formCollection[jFormId].state = "invalid";
      }

    };

    // put our validate event to be fired first
    var bindValidationToField = function($field, $form, userEvt){
      $field.bindFirst(userEvt, function(evt){validateForm(evt, $form, $field)});
    };

    var bindValidationToFormSubmit = function($form){
      $form.bindFirst('submit', function(evt){validateForm(evt, $form)});
    };

    var setUserPreferences = function(config){
      self.config = {
        badValueMessage: config.badValueMessage,
        patternMismatchMessage: config.patternMismatchMessage,
        rangeOverflowMessage: config.rangeOverflowMessage,
        rangeUnderflowMessage: config.rangeUnderflowMessage ,
        stepMismatchMessage: config.stepMismatchMessage,
        tooLongMessage: config.tooLongMessage,
        tooShortMessage: config.tooLongMessage,
        typeMismatchMessage: config.typeMismatchMessage,
        valueMissingMessage: config.valueMissingMessage,
        fieldsDoesNotMatchMessage: config.fieldsDoesNotMatchMessage,
        validateOn: config.validateOn,
        customValidations: config.customValidations,
        disableRules: config.disableRules,
        inputErrorClass: config.inputErrorClass,
        messageErrorClass: config.messageErrorClass,
        preventValidationOnBlur: config.preventValidationOnBlur

      };
    };

    var disableValidationOnForm = function($form){
      $form.attr('novalidate', true);
    };

    var initValidationTo = function(formsId){

      // if user tell us wich forms to validate
      if(formsId){

        var $forms = [];

        // for each form
        formsId.forEach(function(formId){
          $forms.push($(formId));
        });

        setup($forms);

        // if user set 'data-validate' attribute to a form
      }else{
        setup($("form[data-validate]"));
      }

    };

    var isParametersOk = function(formsId, config){
      if(formsId == undefined){
        return true;
      }
      else if(Array.isArray(formsId)){
        return true;
      }else{
        throw "First parameter must be an array of strings, like: ['#formOne', '#formTwo'] or be omitted.";
      }
    };

    // expose our validate method1
    this.validateUsingThisConfig = function(config, formsId){
      $(document).ready(function(){
        try{
          if(isParametersOk(formsId, config)){
            setUserPreferences(config);
            initValidationTo(formsId);
          }
        }catch(err){
          console.log(err);
          throw err;
        }
      });
    };

    // expose our validate method2
    this.validateUsingDefaultConfig = function(formsId){
      $(document).ready(function(){
        try{
          if(isParametersOk(formsId, config)){
            setUserPreferences({});
            initValidationTo(formsId);
          }
        }catch(err){
          console.log(err);
          throw err;
        }
      });
    }

  };

  return new Jvalidator();

})();
