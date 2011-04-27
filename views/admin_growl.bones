// AdminGrowl
// ----------
// Single growl message.
view = Backbone.View.extend({
    className: 'AdminGrowl',
    events: {
        'click a[href$=#close]': 'close'
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
