if (typeof process !== 'undefined') {
    _ = require('underscore')._,
    Backbone = require('backbone'),
    Bones = require('bones');
}

Bones = Bones || {};
Bones.views = Bones.views || {};

// Admin
// -----
// View. Main administrative view. Should be passed an Auth-based model for
// handling login.
Bones.views.Admin = Backbone.View.extend({
    id: 'bonesAdmin',
    events: {
        'click form.login input[type=button]': 'auth',
        'click a[href=#toggle]': 'toggle'
    },
    initialize: function(options) {
        _.bindAll.apply(this, [this].concat(_.methods(this.__proto__)));
        this.model.bind('auth', this.render);
        this.model.bind('auth', this.attach);
        this.render().trigger('attach');
    },
    render: function() {
        $(this.el).html(this.template('Admin', this.model));
        return this;
    },
    attach:function() {
        !$('#bonesAdmin').size() && $('body').append(this.el);
        if (this.model.authenticated) {
            $('body').addClass('bonesAdmin');
            new Bones.views.AdminDropdownUser({
                admin: this,
                model: this.model
            });
            new Bones.views.AdminDropdownDocument();
        }
        return this;
    },
    toggle: function() {
        $('body').toggleClass('bonesAdmin');
        return false;
    },
    auth: function() {
        this.model.authenticate(
            'login',
            {
                id: this.$('input[name=username]').val(),
                password: this.$('input[name=password]').val()
            },
            { error: this.error }
        );
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
        new Bones.views.AdminGrowl(options);
    },
    popup: function(title, content) {
        new Bones.views.AdminPopup({
            title: title || '',
            content: content || ''
        });
    },
    error: function(model, resp) {
        this.growl(
            (resp instanceof XMLHttpRequest) ? resp.response : resp,
            { classes: 'error', autoclose: 0 }
        );
    }
});

// AdminGrowl
// ----------
// View. Single growl message.
Bones.views.AdminGrowl = Backbone.View.extend({
    className: 'growl',
    events: {
        'click a[href=#close]': 'close'
    },
    initialize: function(options) {
        _.bindAll.apply(this, [this].concat(_.methods(this.__proto__)));
        this.options = options || {};
        this.options.message = this.options.message || '';
        this.options.classes = this.options.classes || 'ok';
        this.options.context = this.options.context || $('#bonesAdminGrowl');
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
        this.options.context.append(this.el);
        return this;
    },
    close: function(delay) {
        delay = delay || 0;
        $(this.el).delay(delay).fadeOut(250, this.remove);
        return false;
    }
});

// AdminPopup
// ----------
// View. Modal popup box.
Bones.views.AdminPopup = Backbone.View.extend({
    className: 'popup',
    events: {
        'click a[href=#close]': 'close'
    },
    initialize: function (options) {
        _.bindAll.apply(this, [this].concat(_.methods(this.__proto__)));
        this.options = options || {};
        this.options.title = options.title || '';
        this.options.content = options.content || '';
        this.options.context = this.options.context || $('#bonesAdminPopup');
        if (this.options.content instanceof Backbone.View) {
            this.options.view = this.options.content;
            this.options.content = '';
        }
        this.render();
    },
    render: function () {
        $(this.el).html(this.template('AdminPopup', this.options));
        this.options.view && this.$('.popup-content').append(this.options.view.el);
        this.options.context.append(this.el);
        $('body')
            .addClass('bonesAdminModal')
            .bind('keyup:AdminPopup', function(e) {
                (e.keyCode == 27) && that.close();
            });
        return this;
    },
    close: function() {
        $('body').removeClass('bonesAdminModal');
        $(this.el).fadeOut(250, this.remove);
        return false;
    }
});

// AdminDropdown
// -------------
// View. Menu dropdown view.
Bones.views.AdminDropdown = Backbone.View.extend({
    className: 'dropdown',
    icon: null,
    title: null,
    links: [],
    events: {
        'click a[href=#dropdown]': 'dropdown',
        'click .dropdown ul a': 'dropdown'
    },
    initialize: function (options) {
        _.bindAll.apply(this, [this].concat(_.methods(this.__proto__)));
        options = options || {};
        this.context = options.context || $('#bonesAdminToolbar .menus');
        this.render().trigger('attach');
    },
    render: function () {
        $(this.el).html(this.template('AdminDropdown', this));
        return this;
    },
    attach: function () {
        this.context.prepend(this.el);
        return this;
    },
    dropdown: function(ev) {
        if (!$(this.el).is('.expanded')) {
            $('.expanded', this.context).removeClass('expanded');
        }
        $(this.el).toggleClass('expanded');
        return false;
    }
});

Bones.views.AdminDropdownUser = Bones.views.AdminDropdown.extend({
    icon: 'user',
    events: _.extend({
        'click a[href=#logout]': 'logout'
    }, Bones.views.AdminDropdown.prototype.events),
    links: [
        { href: '#user', title: 'My account' },
        { href: '#userCreate', title: 'Create user' },
        { href: '#userView', title: 'View users' },
        { href: '#logout', title: 'Logout' },
    ],
    initialize: function(options) {
        this.admin = options.admin;
        this.title = this.model.id;
        Bones.views.AdminDropdown.prototype.initialize.call(this, options);
    },
    logout: function() {
        this.model.authenticate('logout', {}, { error: this.admin.error });
        return false;
    }
});

Bones.views.AdminDropdownDocument = Bones.views.AdminDropdown.extend({
    icon: 'docs',
    title: 'Documents',
    links: [
        { href: '#documentCreate', title: 'Create document' },
        { href: '#documentView', title: 'View documents' }
    ]
});

(typeof module !== 'undefined') && (module.exports = Bones.views);
