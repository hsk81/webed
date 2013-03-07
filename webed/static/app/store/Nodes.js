Ext.define ('Webed.store.Nodes', {
    extend: 'Ext.data.TreeStore',
    requires: 'Webed.model.Node',
    model: 'Webed.model.Node',

    root: {
        iconCls: 'icon-node-tree-16',
        uuid_path: ['00000000-0000-0000-0000-000000000000'],
        name_path: ['root'],
        uuid: '00000000-0000-0000-0000-000000000000',
        expanded: true,
        name: 'root',
        mime: 'application/root',
        size: 0
    },

    listeners: {
        append: function (root, record, index) {
            if (!record.isRoot ()) this.decorate (record);
        },

        beforeload: function (store, operation) {
            var uuid = operation.node.get ('uuid'); assert (uuid);
            store.proxy.setExtraParam ('uuid', uuid);

            //
            // Ensure that expanding (and not yet loaded) nodes do not appear
            // twice within the tree by omitting the top node information.
            //

            operation.params.omit_top = !operation.params.uuid;

            //
            // Discontinue loading if `!autoLoad`: Simple method to load store,
            // but only *after* something else sets `autoLoad`!
            //

            return store.autoLoad;
        }
    },

    decorate: function (node) {
        var mime = assert (node.get ('mime'));
        var icon = assert (MIME.to_icon (mime, '-16'));
        node.set ('iconCls', icon);

        //
        // The `beforeexpand` and `expand` event handler ensure together that
        // the *loading* icon appears for expanding (and not yet loaded) nodes.
        //

        function on_beforeexpand (self, eOpts) {
            var loaded = this.get ('loaded');
            if (!loaded) this.set ('iconCls', '');
            this.un ('beforeexpand', on_beforeexpand);
        }

        node.on ('beforeexpand', on_beforeexpand);

        function on_expand (self, eOpts) {
            var loaded = this.get ('loaded');
            if (loaded) this.set ('iconCls', icon);
            this.un ('expand', on_expand);
        }

        node.on ('expand', on_expand);
    },

    autoLoad: false
});
