
// AdminPopup
// ----------
// Modal popup box.
view = Backbone.View.extend({
    className: 'AdminPopup',
    title: '',
    content: '',
    view: null,
    admin: null,
    context: null,
    events: {
        'click a[href$=#close]': 'close'
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
        $(this.el).html(templates['AdminPopup'](this));
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
