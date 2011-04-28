// AdminDropdown
// -------------
// Menu dropdown view.
view = Backbone.View.extend({
    className: 'dropdown',
    icon: null,
    title: null,
    links: [],
    admin: null,
    context:null,
    events: {
        'click a[href$=#dropdown]': 'dropdown',
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
        $(this.el).html(templates['AdminDropdown'](this));
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
