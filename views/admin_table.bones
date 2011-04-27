// AdminTable
// ----------
// Administrative table.
view = views['AdminPopup'].extend({
    rowView: 'AdminTableRow',
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
