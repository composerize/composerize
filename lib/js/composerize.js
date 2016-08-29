require('../scss/composerize-pkg.scss');
require('../scss/tipped.scss');
const converter = require('./converter').default;

$(document).ready(function () {
    Tipped.create('.copy-button', 'Copy');

    const clipboard = new Clipboard('.copy-button');

    clipboard.on('success', function(e) {
        $('.tpd-content').text('Copied!');
        Tipped.refresh();
        e.clearSelection();
    });

    $('.inputbox').focus();
    updateResult();

    $('.inputbox').keyup(updateResult);
});

function updateResult() {
    const results = converter($('.inputbox').val());
    $('.result_contents').text(results);
    Tipped.remove($('.copy-button'));
    Tipped.create('.copy-button', 'Copy');
}
