if (typeof process !== 'undefined') {
    _ = require('underscore')._,
    Backbone = require('backbone'),
    Bones = require('bones');
}

Bones = Bones || {};
Bones.views = Bones.views || {};

// Admin
// -----
// View. Administrative header view. Should be passed an Auth model for
// handling login.
Bones.views.Admin = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'auth');
        this.model.bind('auth', this.render);
        this.render();
    },
    render: function() {
        $(this.el).html(this.template('Admin', this.model));
        !$('#bones-admin').size() && $('body').prepend(this.el);
        this.model.authenticated && $('body').addClass('bones-admin');
        return this;
    },
    events: {
        'click .toggle': 'toggle',
        'click form.login input[type=button]': 'auth'
    },
    toggle: function() {
        $('body').toggleClass('bones-admin');
        return false;
    },
    auth: function() {
        if (this.model.authenticated) {
            this.model.authenticate('logout', {});
        } else {
            this.model.authenticate('login', {
                id: this.$('input[name=username]').val(),
                password: this.$('input[name=password]').val()
            });
        }
        this.$('input[name=username]').val('');
        this.$('input[name=password]').val('');
        return false;
    },
    setPanel: function(view) {
        if (view) {
            this.$('.panel').html(view.el);
        } else {
            this.$('.panel').empty();
        }
    }
});

(typeof module !== 'undefined') && (module.exports = Bones.views);
