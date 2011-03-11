if (typeof process !== 'undefined') {
    _ = require('underscore')._,
    Backbone = require('backbone'),
    Bones = require('bones');
}

var Bones = Bones || {};
Bones.views = Bones.views || {};

// Admin
// -----
// Main administrative view.
//
// - `options.model` Instantiated auth-based model for handling login.
// - `options.dropdowns` Array of dropdown view classes. Optional.
Bones.views.Admin = Backbone.View.extend({
    id: 'bonesAdmin',
    dropdowns: [ Bones.views.AdminDropdownUser ],
    events: {
        'click form.login input[type=submit]': 'auth',
        'click a[href=#toggle]': 'toggle'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'attach', 'toggle', 'auth', 'setPanel', 'error');
        options = options || {};
        this.dropdowns = options.dropdowns || this.dropdowns,
        this.model.bind('auth', this.render);
        this.model.bind('auth', this.attach);
        this.render().trigger('attach');
    },
    render: function() {
        $(this.el).html(this.template('Admin', this.model));
        return this;
    },
    attach:function() {
        var that = this;
        !$('#bonesAdmin').size() && $('body').append(this.el);
        if (this.model.authenticated) {
            $('body').addClass('bonesAdmin');
            _.each(this.dropdowns, function(Dropdown) {
                new Dropdown({admin: that, model: that.model});
            });
        }
        return this;
    },
    toggle: function() {
        $('body').toggleClass('bonesAdmin');
        return false;
    },
    auth: function() {
        this.model.authenticate('login', {
            id: this.$('input[name=username]').val(),
            password: this.$('input[name=password]').val()
        }, { error: this.error });
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
    error: function(model, resp) {
        new Bones.views.AdminGrowl({
            message: (resp instanceof XMLHttpRequest) ? resp.response : resp,
            classes: 'error',
            autoclose: 0
        });
    }
});

// AdminGrowl
// ----------
// Single growl message.
Bones.views.AdminGrowl = Backbone.View.extend({
    className: 'AdminGrowl',
    events: {
        'click a[href=#close]': 'close'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'close');
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
// Modal popup box.
Bones.views.AdminPopup = Backbone.View.extend({
    className: 'AdminPopup',
    title: '',
    content: '',
    view: null,
    admin: null,
    context: null,
    events: {
        'click a[href=#close]': 'close'
    },
    initialize: function (options) {
        _.bindAll(this, 'render', 'close');
        options = options || {};
        this.title = options.title || this.title;
        this.admin = options.admin || null;
        this.content = options.content || this.content;
        this.context = options.context || $('#bonesAdminPopup');
        // @TODO apparently `this.content instanceof Backbone.View` does not
        // work here...
        if (this.content.el) {
            this.view = this.content;
            this.content = '';
        }
        this.render();
    },
    render: function () {
        if (this.$('.content').size()) return this;

        var that = this;
        $(this.el).html(this.template('AdminPopup', this));
        this.view && this.$('.content').append(this.view.el);
        this.context.append(this.el);
        $('body')
            .addClass('bonesAdminModal')
            .bind('keyup.AdminPopup', function(e) {
                (e.keyCode == 27) && that.close();
            });
        return this;
    },
    close: function() {
        $('body')
            .removeClass('bonesAdminModal')
            .unbind('.AdminPopup');
        $(this.el).fadeOut(250, this.remove);
        return false;
    }
});

// AdminDropdown
// -------------
// Menu dropdown view.
Bones.views.AdminDropdown = Backbone.View.extend({
    className: 'dropdown',
    icon: null,
    title: null,
    links: [],
    admin: null,
    context:null,
    events: {
        'click a[href=#dropdown]': 'dropdown',
        'click .dropdown ul a': 'dropdown'
    },
    initialize: function (options) {
        _.bindAll(this, 'render', 'attach', 'dropdown');
        options = options || {};
        this.admin = options.admin || null;
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

// AdminDropdownUser
// -----------------
// User management dropdown.
Bones.views.AdminDropdownUser = Bones.views.AdminDropdown.extend({
    icon: 'user',
    events: _.extend({
        'click a[href=#logout]': 'logout',
        'click a[href=#user]': 'user',
        'click a[href=#userCreate]': 'userCreate',
        'click a[href=#userView]': 'userView'
    }, Bones.views.AdminDropdown.prototype.events),
    links: [
        { href: '#user', title: 'My account' },
        { href: '#userCreate', title: 'Create user' },
        { href: '#userView', title: 'View users' },
        { href: '#logout', title: 'Logout' },
    ],
    initialize: function(options) {
        this.title = this.model.id;
        _.bindAll(this, 'logout', 'user', 'userCreate', 'userView');
        Bones.views.AdminDropdown.prototype.initialize.call(this, options);
    },
    logout: function() {
        this.model.authenticate('logout', {}, { error: this.admin.error });
        return false;
    },
    user: function() {
        new Bones.views.AdminPopupUser({
            title: 'My account',
            model: this.model,
            admin: this.admin
        });
        return false;
    },
    userCreate: function() {
        new Bones.views.AdminPopupUser({
            title: 'Create user',
            model: new this.model.constructor(),
            admin: this.admin
        });
        return false;
    },
    userView: function() {
        new Bones.views.AdminTable({
            title: 'Users',
            collection: new Bones.models.Users(),
            admin: this.admin,
            header: [
                {title:'Username'},
                {title:'Actions', className:'actions'}
            ],
            rowView: Bones.views.AdminTableRowUser
        });
        return false;
    }
});

// AdminPopupUser
// --------------
// User account creation/update popup.
Bones.views.AdminPopupUser = Bones.views.AdminPopup.extend({
    events: _.extend({
        'click input[type=submit]': 'submit'
    }, Bones.views.AdminPopup.prototype.events),
    initialize: function (options) {
        _.bindAll(this, 'submit');
        this.create = !Boolean(this.model.id);
        this.content = this.template('AdminFormUser', this.model);
        Bones.views.AdminPopup.prototype.initialize.call(this, options);
    },
    submit: function() {
        var that = this;
        var params = {
            id: this.model.id || this.$('input[name=id]').val(),
            password: this.$('input[name=password]').val(),
            passwordConfirm: this.$('input[name=passwordConfirm]').val()
        };
        this.model.save(params, {
            success: function() {
                var message = that.create
                    ? 'User ' + that.model.id + ' created.'
                    : 'Password changed.';
                new Bones.views.AdminGrowl({message: message});
                that.close();
            },
            error: this.admin.error
        });
        return false;
    }
});


// AdminTableRow
// -------------
// Generic table row view.
Bones.views.AdminTableRow = Backbone.View.extend({
    tagName: 'tr',
    events: {
        'click input.delete': 'del'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'del', 'remove');
        this.render().trigger('attach');
    },
    render: function () {
        $(this.el).html(this.template('AdminTableRow', this.model));
        return this;
    },
    del: function() {
        if (!confirm('Are you sure you want to delete this item?')) return false;
        this.model.destroy({ success: this.remove });
        return false;
    }
});

// AdminTableRowUser
// -----------------
// Custom table row for users.
Bones.views.AdminTableRowUser = Bones.views.AdminTableRow.extend({
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.render().trigger('attach');
    },
    render: function () {
        $(this.el).html(this.template('AdminTableRowUser', this.model));
        return this;
    }
});

// AdminTable
// ----------
// Administrative table.
Bones.views.AdminTable = Bones.views.AdminPopup.extend({
    rowView: Bones.views.AdminTableRow,
    header: null,
    initialize: function(options) {
        _.bindAll(this, 'render');
        this.rowView = options.rowView || this.rowView;
        this.header = options.header || this.header;
        this.content = this.template('AdminTable', this);
        this.collection.bind('all', this.render);
        this.collection.fetch();
        Bones.views.AdminPopup.prototype.initialize.call(this, options);
    },
    render: function () {
        var that = this;
        $(this.el).addClass('AdminTable');
        Bones.views.AdminPopup.prototype.render.call(this);
        this.collection.each(function(model) {
            if (model.view) return;
            model.view = new that.rowView({
                model: model,
                admin: that.admin,
                table: that
            });
            that.$('table').append(model.view.el);
        });
        return this;
    }
});

(typeof module !== 'undefined') && (module.exports = {
    views: {
        Admin: Bones.views.Admin,
        AdminGrowl: Bones.views.AdminGrowl,
        AdminPopup: Bones.views.AdminPopup,
        AdminDropdown: Bones.views.AdminDropdown,
        AdminDropdownUser: Bones.views.AdminDropdownUser,
        AdminPopupUser: Bones.views.AdminPopupUser,
        AdminPopupUsers: Bones.views.AdminPopupUsers,
        AdminTableRow: Bones.views.AdminTableRow,
        AdminTable: Bones.views.AdminTable
    }
});
