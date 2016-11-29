'use strict';

// our global variable to hold our plugin
var jvalidator = (function () {
 
 	// this is our plugin
	var Jvalidator = function(){

		// globals
		var self = this;
		var formCollection = {};
	
		//var formsId = [];

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

		var createAdjacentElementTo = function(element){

			var $divToErrorMessage = $("<div hidden data-error-message></div>");
			if(self.config.messageErrorClass){
				$divToErrorMessage.addClass(config.messageErrorClass);
			}else{
				$divToErrorMessage.css({"color": "red"});
			}

			$(element).after($divToErrorMessage);

		};

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
			updateFormCollection($form, element, "invalid");
		};

		// undo actions did on error
		var unapplyErrorAction = function($form, element){
			unapplyErrorClassOn(element);
			enableComponentsBasedOn(element);
			clearErrorMessageNear(element);
			updateFormCollection($form, element, "valid")
		};

		var validateFieldOnForm = function(element, $form, event){

			var msg = "";
			var hasError = false;
			var customValidationValue = $(event.target).attr("data-validate-using");
			var extendedValidationValue = $(event.target).attr("data-extended-validate");


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
				// check using regex if extendedValidationValue matches with 'match(#field1, #field2)'
				// if yes, call our function;
			}
			// custom validation provided by the user
			else if(customValidationValue){

				// get on config object the rule applied to our input by 'data-validate-using' attribute
				var validationRule = self.config.customValidations.find(function(rule){
					return rule.key == customValidationValue;
				});

				// if there is no handler in our config object
				if(!validationRule){
					throw "key '" + customValidationValue + "' passed to attribute 'data-validate-using' not found on config object";
				}else if(!$.isFunction(validationRule.validate)){
					throw 'you must pass a function as value';
				}

				// call custom function
				var isValid = validationRule.validate(element);

				if(!isValid){
					hasError = true;
					msg = validationRule.customInvalidMessage;
				}

			}
			
			// final validation result
			var formInfo = getFormInfo($form);
			if(hasError){

				// prevent other handlers to be fired
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();

				updateFormCollection($form, element, 'invalid');
				applyErrorAction($form, element, msg);

				return false;

			}else{
				updateFormCollection($form, element, 'valid');
				unapplyErrorAction($form, element);
				return true;
			}

		};

		var validateForm = function($form, event){
	
			var i = 0;
			var isValid = true;
			var formInfo = getFormInfo($form);

			// we don`t want to submit form
			if(event){
				event.preventDefault();
			}

			if(formInfo.state == 'initial'){

				// for each field on form
				for(var p in formInfo){
					if(p != 'state'){
						var control = formInfo[p];
						if(control.state == 'invalid'){
							isValid = false;
						}else if(control.state == 'initial'){
							var query = "*[jControlId='" + p + "']";
							var control = $(query)[0];
							if(!validateFieldOnForm(control, $form)){
								isValid = false;
							}
						}
					}
				}
			}else{

				// we must check fields state
				for(var p in formInfo){
					if(p != 'state'){
						var control = formInfo[p];
						if(control.state == 'invalid'){
							isValid = false;
							break;
						}
					}
				}
			}

			if(!isValid){

				disableSubmitOnForm($form, true);
				if(event){
					event.stopPropagation();
					event.stopImmediatePropagation();
				}

			}else{
				disableSubmitOnForm($form, false);
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

							if(field)
								return true;
							else{
								return false;
							}

						});

						// we always apply blur validation, except if user cancel this
						if(!self.config.preventValidationOnBlur)
							bindValidationToFieldOnForm($component, $form, 'blur');

						// if we found rule for this $component
						if(rule && rule.event != 'blur'){
							bindValidationToFieldOnForm($component, $form, rule.event);

						// else, we apply default behavior
						}else{

							// by default we aplly validation on keyup to text input
							if($component.is("input[type='text'") || $component.is("textarea")){
								//bindValidationToFieldOnForm($component, $form, "keyup");
								bindValidationToFieldOnForm($component, $form, "input");

							// and apply validation on 'change' to remaining controllers
							}else{
								bindValidationToFieldOnForm($component, $form, "change");
							}
							
						}
						
					// default behavior
					}else{

						// by default we aplly validation on keyup to text input
						if($component.is("input[type='text'") || $component.is("textarea")){
							//bindValidationToFieldOnForm($component, $form, "keyup");
							bindValidationToFieldOnForm($component, $form, "input");
							
						// and apply validation on 'change' to remaining controllers
						}else{
							bindValidationToFieldOnForm($component, $form, "change");
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
		
		validateForm($form);
		


	};

	// put our validate event to be fired first
	var bindValidationToFieldOnForm = function($field, $form, event){
		$field.bindFirst(event, function(event){validateFieldOnForm($field[0], $form, event)});
	};

	var bindValidationToFormSubmit = function($form){
		$form.bindFirst('submit', function(event){validateForm($form, event)});
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