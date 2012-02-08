// AdminTableRow
// -------------
// Generic table row view.
view = Backbone.View.extend({
    tagName: 'tr',
    events: {
        'click input.delete': 'del'
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'del', 'remove');
        this.render();
    },
    render: function () {
        $(this.el).html(templates['AdminTableRow'](this.model));
        return this;
    },
    del: function() {
        if (!confirm('Are you sure you want to delete this item?')) return false;
        this.model.destroy({ success: this.remove });
        return false;
    }
});

