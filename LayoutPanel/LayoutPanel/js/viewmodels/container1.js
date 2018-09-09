define([CURRENT_DOMAIN + "js/libs/knockout.js"],
    function (ko) {

        var viewModel = {
            text: ko.observable('')
        };

        viewModel.render = function () {
            viewModel.text('Child container');
        };

        return viewModel;
    });