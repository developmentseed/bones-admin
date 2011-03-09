if (typeof process !== 'undefined') {
    _ = require('underscore')._,
    Backbone = require('backbone'),
    Bones = require('bones');
}

Bones = Bones || {};
Bones.views = Bones.views || {};

Bones.views.AdminGrowl = Backbone.View.extend({
});

Bones.views.AdminPopup = Backbone.View.extend({
});

// Admin
// -----
// View. Main administrative view. Should be passed an Auth-based model for
// handling login.
Bones.views.Admin = Backbone.View.extend({
    id: 'bonesAdmin',
    events: {
        'click form.login input[type=button]': 'auth',
        'click a[href=#dropdown]': 'dropdown',
        'click .dropdown ul a': 'dropdown',
        'click a[href=#toggle]': 'toggle',
        'click a[href=#logout]': 'auth'
    },
    initialize: function(options) {
        _.bindAll.apply(this, [this].concat(_.methods(Bones.views.Admin.prototype)));
        this.model.bind('auth', this.render);
        this.render();
    },
    render: function() {
        $(this.el).html(this.template('Admin', this.model));
        !$('#bonesAdmin').size() && $('body').append(this.el);
        this.model.authenticated && $('body').addClass('bonesAdmin');
        return this;
    },
    dropdown: function(ev) {
        var context = $(ev.currentTarget).parents('.dropdown');
        if (context.is('.expanded')) {
            context.toggleClass('expanded');
        } else {
            this.$('.dropdown.expanded').removeClass('expanded');
            context.toggleClass('expanded');
        }
        return false;
    },
    toggle: function() {
        $('body').toggleClass('bonesAdmin');
        return false;
    },
    auth: function() {
        var that = this;
        if (this.model.authenticated) {
            this.model.authenticate('logout', {}, { error: this.error });
        } else {
            this.model.authenticate('login', {
                id: this.$('input[name=username]').val(),
                password: this.$('input[name=password]').val()
            }, { error: this.error });
        }
        this.$('input[name=username], input[name=password]').val('');
        return false;
    },
    setPanel: function(view) {
        if (view) {
            this.$('.panel').html(view.el);
        } else {
            this.$('.panel').empty();
        }
    },
    growl: function(message, options) {
        options = options || {};
        options.message = message;
        var growl = new Bones.views.AdminGrowl(options);
        this.$('#bonesAdminGrowl').append(growl.el);
    },
    popup: function() {
    },
    error: function(model, resp) {
        this.growl(
            (resp instanceof XMLHttpRequest) ? resp.response : resp,
            { classes: 'error', autoclose: 0 }
        );
    }
});

// AdminGrowl
// ------------
// View. Single growl message.
Bones.views.AdminGrowl = Backbone.View.extend({
    className: 'growl',
    events: {
        'click a[href=#close]': 'close'
    },
    initialize: function(options) {
        _.bindAll(this);
        this.options = options || {};
        this.options.message = this.options.message || '';
        this.options.classes = this.options.classes || 'ok';
        if (_.isUndefined(this.options.autoclose)) {
            this.options.autoclose = 2000;
        }
        this.render();
    },
    render: function() {
        $(this.el)
            .html(this.template('AdminGrowl', {
                message: this.options.message,
                autoclose: Boolean(this.options.autoclose)
            }))
            .addClass(this.options.classes);
        this.options.autoclose && this.close(this.options.autoclose);
        return this;
    },
    close: function(delay) {
        delay = delay || 0;
        $(this.el).delay(delay).fadeOut(250, this.remove);
        return false;
    }
});

(typeof module !== 'undefined') && (module.exports = Bones.views);
