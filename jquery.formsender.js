/*
    * Form Sender jQuery Plugin v1.1e
    * Made for Nigel S. Ball and Chris Lang (19Seven Pty. Ltd.)
    * @author Jaycliff Arcilla of ESPC Davao
    
    Requires jQuery 1.6.x+
    
    Version History:
    
    v1.1e   -   Revised field-checking routines (red backgrounds on errored fields)
    v1.1d   -   Cleaned up code to pass JSLint coding standards. Improved field-checking routines
    v1.1c   -   Added simple email verification inside the default form-checking routine
    v1.1b   -   Added default form-checking routines
            -   Added 'dataType' option (default is 'html')
    v1.1    -   Modified to adapt to jQuery 1.6.x preferences [changed all attr() methods to prop()]
    v1.0    -   Initial release
*/

/*
    
    Passed JSLint checking! (http://www.jslint.com/)
    
    JSLINT OPTIONS:
    
    * Assume console, alert, ...
    * Assume a browser
    * Add 'jQuery' as a global variable in JSLint
    
*/

(function ($) {
    "use strict";
    // $.fn === $.prototype
    $.fn.extend({
        formSender: function (user_defined_options) {
            // Insert all plugin-specific code inside this anonymous function
            // Insert all default option values here
            var default_options = {
                serverSideFormProcessorURL: '',
                waitText: 'Please wait...',
                redirectText: 'Redirecting...',
                resubmitText: 'Resubmit form',
                method: 'POST',
                dataType: 'html',
                executeBeforeSend: function (obj) {
                    var firstName, lastName, emailAddress, failsend, error_bg;
                    firstName = obj.find('input[name="first_name"]');
                    lastName = obj.find('input[name="last_name"]');
                    emailAddress = obj.find('input[name="email_address"]');
                    failsend = false;
                    error_bg = '#ffaaaa';
                    function validateEmail(elementValue) {
                        var emailPattern = /^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+[\.]{1}[a-zA-Z]{2,4}$/;
                        return emailPattern.test(elementValue);
                    }
                    /*
                        In older versions of IE, individual characters of strings cannot be accessed by array-like indeces!
                        Updated to work in IE (thanks charAt());
                    */
                    function inputIsEmpty(value) {
                        var i;
                        if (value === undefined || value === '') { return true; }
                        for (i = 0; i < value.length; i += 1) {
                            if (value.charAt(i) !== ' ') { return false; }
                        }
                        return true;
                    }
                    if (firstName.length) {
                        if (!firstName.data('default_bg')) { firstName.data('default_bg', firstName.css('background-color')); }
                        if (inputIsEmpty(firstName.prop('value')) || firstName.prop('value') === '' || firstName.prop('value') === undefined || firstName.prop('value') === null) {
                            firstName.css('background-color', error_bg).css('line-height', firstName.data('line-height'));
                            failsend = true;
                        } else {
                            firstName.css('background-color', firstName.data('default_bg'));
                        }
                    }
                    if (lastName.length) {
                        if (!lastName.data('default_bg')) { lastName.data('default_bg', lastName.css('background-color')); }
                        if (inputIsEmpty(lastName.prop('value')) || lastName.prop('value') === '' || lastName.prop('value') === undefined || lastName.prop('value') === null) {
                            lastName.css('background-color', error_bg).css('line-height', lastName.data('line-height'));
                            failsend = true;
                        } else {
                            lastName.css('background-color', lastName.data('default_bg'));
                        }
                    }
                    if (emailAddress.length) {
                        if (!emailAddress.data('default_bg')) { emailAddress.data('default_bg', emailAddress.css('background-color')); }
                        if (inputIsEmpty(emailAddress.prop('value')) || emailAddress.prop('value') === '' || emailAddress.prop('value') === undefined || emailAddress.prop('value') === null || !validateEmail(emailAddress.prop('value'))) {
                            emailAddress.css('background-color', error_bg).css('line-height', emailAddress.data('line-height'));
                            failsend = true;
                        } else {
                            emailAddress.css('background-color', emailAddress.data('default_bg'));
                        }
                    } else {
                        failsend = true;
                        alert('You know, at least provide an email entry-field so that I can do my job properly. Is that alright with you?');
                    }
                    if (failsend) { return false; }
                    return true;
                },
                executeOnFinish: function (obj) {
                    var redirect_to;
                    if (obj.serverReturnedData.search('errorcode:666') !== (-1)) {
                        obj.messageContainer.html(obj.serverReturnedData.substring(obj.serverReturnedData.indexOf(':') + 4));
                        obj.submitButton.setContent(obj.submitButton.data('otext')).enable();
                    } else {
                        obj.messageContainer.html('');
                        obj.submitButton.setContent('Submitted!');
                        if (obj.serverReturnedData.search('errorcode:214') !== (-1)) {
                            alert('You are already subscribed to the list.');
                        } else {
                            alert('Message is sent!');
                        }
                        if (obj.find('input[name="redirect_url"]').length !== 0) {
                            redirect_to = obj.find('input[name="redirect_url"]').prop('value');
                            if (obj.find('input[name="send_details"]').length !== 0) { redirect_to += '?firstname=' + obj.find('input[name="first_name"]').prop('value'); }
                            // Use this to keep the previous page in history
                            //window.top.location.href = redirect_to;
                            // Otherwise, use this to completely change the history. LOL.
                            window.top.location.replace(redirect_to);
                        }
                    }
                }
            };
            // This function mimics PHP's handy isset function. Unlike the php variant, this doesn't work with undeclared variables. A great shame.
            function isset(variable) {
                if (variable === undefined || variable === null || variable === '') { return false; }
                return true;
            }
            if (!isset(user_defined_options)) {
                // If the user didn't pass any parameter, set options with the default one
                user_defined_options = default_options;
            } else {
                // ^Otherwise, update the default options with the user-defined ones
                user_defined_options = $.extend(default_options, user_defined_options);
            }
            // This function sets the inner text of submit buttons. Calling this function without the 'content' parameter backs up the original text as a jQuery data
            function setSubmitterMessage(obj, content) {
                // lo is for the button tag
                var tag_name, backup, lo;
                // the get() method returns the dom element itself
                tag_name = obj.get(0).nodeName;
                if (!isset(obj.data('otext'))) {
                    backup = true;
                    if (!isset(content)) { content = ''; }
                }
                switch (tag_name.toLowerCase()) {
                case 'input':
                    switch (obj.prop('type')) {
                    case 'submit':
                        if (isset(backup)) { obj.data('otext', obj.prop('value')); }
                        obj.prop('value', content);
                        break;
                    case 'image':
                        if (isset(backup)) { obj.data('otext', obj.prop('alt')); }
                        obj.prop('alt', content);
                        break;
                    default:
                        alert('Unknown input element type!');
                        break;
                    }
                    break;
                case 'button':
                    lo = obj;
                    while (lo.children().length > 0) {
                        // the eq() method returns a jQuery object based on the given index
                        lo = lo.children().eq(0);
                    }
                    if (isset(backup)) { obj.data('otext', lo.html()); }
                    lo.html(content);
                    break;
                default:
                    alert('Unknown submitter element!');
                    break;
                }
            }
            // 'this' here contains the jquery object itself (the one calling this plugin) so no need to wrap it with jQuery()
            this.each(function () {
                // ssfp_url means 'Server-side Form Processor URL'. Now you know. - Manny
                var options, formObject, ssfp_url;
                options = user_defined_options;
                // 'this' here, however, refers to the HTML dom element itself so you have to wrap it with jQuery() to use, uh, jQuery methods and other goodies
                formObject = $(this);
                formObject.submitButton = formObject.find('button[type="submit"], input[type="submit"], input[type="image"]');
                if (formObject.find('input[name="submitted"]').length === 0) { formObject.prepend('<input type="hidden" name="submitted" value="true" />'); }
                if (formObject.find('input[name="ajax"]').length === 0) { formObject.prepend('<input type="hidden" name="ajax" value="true" />'); }
                if (formObject.find('div.note').length === 0) { formObject.append('<div class="note"></div>'); }
                formObject.messageContainer = formObject.find('div.note');
                formObject.submitButton.setContent = function (content) {
                    this.each(function () {
                        setSubmitterMessage($(this), content);
                    });
                    return this;
                };
                formObject.submitButton.disable = function () {
                    this.each(function () {
                        $(this).prop({ disabled: true }).addClass('disabled');
                    });
                    return this;
                };
                formObject.submitButton.enable = function () {
                    this.each(function () {
                        $(this).prop({ disabled: false }).removeClass('disabled');
                    });
                    return this;
                };
                formObject.serverReturnedData = null;
                formObject.submit(function (event) {
                    var form_data, before_send_return_value;
                    // Converts form data into standard URL-encoded notation (e.g. 'fname=Jaycliff&lname=Arcilla&awesome=true')
                    form_data = $(this).serialize();
                    if (options.serverSideFormProcessorURL === '') {
                        if (formObject.prop('action') === '') {
                            // alert("Please provide a url for the server-side form processor\n\nExample: http://www.yoursite.com/form.php");
                            formObject.messageContainer.html('<div style="border:solid 1px #f00;padding:10px;margin:10px;"><strong style="color:#f00;">Error: No target url specified</strong><br /><br />Please provide the url of the server-side form processor.<br /><strong>Example: http://www.yoursite.com/form.php</strong></div>');
                            event.preventDefault();
                            return;
                        }
                        ssfp_url = formObject.prop('action');
                    } else {
                        // User defined form urls should always be a top priority
                        ssfp_url = options.serverSideFormProcessorURL;
                    }
                    formObject.submitButton.setContent(options.waitText).disable();
                    if (typeof options.executeBeforeSend === 'function') {
                        before_send_return_value = options.executeBeforeSend(formObject);
                        if (before_send_return_value === false || before_send_return_value === 0 || before_send_return_value === null) {
                            //alert('The function returned false. Form submission failed.');
                            formObject.submitButton.setContent(formObject.submitButton.data('otext')).enable();
                            event.preventDefault();
                            return;
                        }
                    } else {
                        alert('Error: Value for \'executeBeforeSend\' must be a function');
                        formObject.submitButton.setContent(formObject.submitButton.data('otext')).enable();
                        event.preventDefault();
                        return;
                    }
                    $.ajax({
                        type: options.method,
                        url: ssfp_url,
                        dataType: options.dataType,
                        data: form_data,
                        // ssfp_msg means 'Server-Side Form Processor Message' and not 'Super Spicy Fine-Particled Monosodium Glutamate'
                        success: function (ssfp_msg) {
                            formObject.serverReturnedData = ssfp_msg;
                            if (typeof options.executeOnFinish === 'function') { options.executeOnFinish(formObject); }
                        }
                    });
                    // Prevents the form element from performing its default action (form submission)
                    event.preventDefault();
                });
            });
            // Returns the calling object to maintain jQuery's 'chainability'
            return this;
        }
    });
}(window.jQuery));
