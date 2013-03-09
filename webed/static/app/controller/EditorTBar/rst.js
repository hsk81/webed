Ext.define ('Webed.controller.EditorTBar.rst', {
    extend: 'Webed.controller.EditorTBar.txt',

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    init: function () {
        this.control ({
            'editor-tbar-rst button[action=undo]': {
                click: this.undo
            },
            'editor-tbar-rst button[action=redo]': {
                click: this.redo
            },
            'editor-tbar-rst button[action=cut]': {
                click: this.cut
            },
            'editor-tbar-rst button[action=copy]': {
                click: this.copy
            },
            'editor-tbar-rst button[action=paste]': {
                click: this.paste
            },

            'editor-tbar-rst button[action=apply-heading-0]': {
                click: function (button) {
                    EDITOR = assert (this.codemirror (button));
                }
            },
            'editor-tbar-rst menuitem[action=apply-heading-1]': {
                click: Ext.pass (this.apply_heading, [1], this)
            },
            'editor-tbar-rst menuitem[action=apply-heading-2]': {
                click: Ext.pass (this.apply_heading, [2], this)
            },
            'editor-tbar-rst menuitem[action=apply-heading-3]': {
                click: Ext.pass (this.apply_heading, [3], this)
            },
            'editor-tbar-rst menuitem[action=apply-heading-4]': {
                click: Ext.pass (this.apply_heading, [4], this)
            },
            'editor-tbar-rst menuitem[action=apply-heading-5]': {
                click: Ext.pass (this.apply_heading, [5], this)
            },
            'editor-tbar-rst menuitem[action=apply-heading-6]': {
                click: Ext.pass (this.apply_heading, [6], this)
            },

            'editor-tbar-rst button[action=toggle-strong]': {
                click: this.toggle_strong
            },
            'editor-tbar-rst button[action=toggle-italic]': {
                click: this.toggle_italic
            },
            'editor-tbar-rst button[action=toggle-literal]': {
                click: this.toggle_literal
            },

            'editor-tbar-rst button[action=toggle-subscript]': {
                click: this.toggle_subscript
            },
            'editor-tbar-rst button[action=toggle-supscript]': {
                click: this.toggle_supscript
            },

            'editor-tbar-rst button[action=lower-case]': {
                click: this.lower_case
            },
            'editor-tbar-rst button[action=upper-case]': {
                click: this.upper_case
            },

            'editor-tbar-rst button[action=decrease-indent]': {
                click: this.decrease_indent
            },
            'editor-tbar-rst button[action=increase-indent]': {
                click: this.increase_indent
            },

            'editor-tbar-rst button[action=toggle-bullet-list]': {
                click: this.toggle_bullet_list
            },
            'editor-tbar-rst button[action=toggle-number-list]': {
                click: this.toggle_number_list
            },

            'editor-tbar-rst button[action=insert-figure]': {
                click: this.insert_figure
            },
            'editor-tbar-rst button[action=insert-image]': {
                click: this.insert_image
            },
            'editor-tbar-rst button[action=insert-hyperlink]': {
                click: this.insert_hyperlink
            },
            'editor-tbar-rst button[action=insert-footnote]': {
                click: this.insert_footnote
            },
            'editor-tbar-rst button[action=insert-horizontal-line]': {
                click: this.insert_horizontal_line
            },

            'editor-tbar-rst button[action=find]': {
                click: this.find
            },
            'editor-tbar-rst button[action=find-next]': {
                click: this.find_next
            },
            'editor-tbar-rst button[action=find-previous]': {
                click: this.find_previous
            },
            'editor-tbar-rst button[action=replace-all]': {
                click: this.replace_all
            },
            'editor-tbar-rst button[action=clear-search]': {
                click: this.clear_search
            }
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    heading_marker: function (level) {
        return {1:'#', 2:'*', 3:'=', 4:'-', 5:'^', 6:'.. rubric::'}[level];
    },

    apply_heading: function (level, button) {
        var editor = assert (this.codemirror (button));
        var marker = assert (this.heading_marker (level));

        switch (level) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                apply_heading_1to5.call (this, marker, level);
                break;
            case 6:
                apply_heading_6.call (this, marker);
                break;
            default:
                throw new Exception ('invalid level:', level);
        }

        function apply_heading_1to5 (marker, level) {
            remove_heading.call (this, function () {
                var sel = editor.getSelection ();
                if (sel) {
                    var head = '';
                    var size = (sel.length < 64) ? sel.length : 4;
                    for (var idx = 0; idx < size; idx++) head += marker;
                    var tpl = (level == 1) ? '{0}\n{1}\n{0}' : '{1}\n{0}';
                    editor.replaceSelection (String.format (tpl, head, sel));
                    editor.setCursor (editor.getCursor (true));
                }
            });
        }

        function apply_heading_6 (marker) {
            remove_heading.call (this, function () {
                var sel = editor.getSelection();
                if (sel) {
                    var rep = sel.replace (/\s+$/, '');
                    var tpl = marker + ' ' + '{0}';
                    editor.replaceSelection (String.format (tpl, rep));
                    editor.setCursor (editor.getCursor (true));
                }
            });
        }

        function remove_heading (callback) {
            var beg = editor.getCursor (true);
            var end = editor.getCursor ();
            var tok = [], upp, low;

            for (var n = -3; n < 3; n++) {
                tok[n] = editor.getTokenAt ({line:end.line + n,ch:1});
                tok[n].line = end.line + n;

                if (tok[n].className == 'header') {
                    if (upp) { low = tok[n]; } else { upp = tok[n]; }
                }
            }

            var sel = editor.getSelection ();
            if (sel) {
                remove_heading_6.call (this);

                if (tok[-3] && tok[-3].className == 'header' && !low) return;
                if (tok[-2] && tok[-2].className == 'header' && !low) return;
                if (low) editor.removeLine (low.line);
                if (upp) editor.removeLine (upp.line);

                reset_cursor.call (this);

                var cur = editor.getCursor ();
                var txt = editor.getLine (cur.line);

                editor.setSelection (
                    {line:cur.line, ch:0}, {line:cur.line, ch:txt.length}
                );

                if (callback) callback.call (this);
            }

            function remove_heading_6 () {
                var marker = assert (this.heading_marker (6));
                var rx = new RegExp (marker + '(\\s*)');
                if (sel.match (rx)) {
                    editor.replaceSelection (sel.replace (rx, ''));
                } else {
                    var cur = editor.getCursor ();
                    var txt = editor.getLine (cur.line);
                    if (txt && txt.match (rx)) {
                        editor.setLine (cur.line, txt.replace (rx, ''));
                    }
                }
            }

            function reset_cursor () {
                if (upp && low)
                    editor.setCursor ({line:upp.line - 0, ch:0});
                else if (upp || low)
                    editor.setCursor ({line:upp.line - 1, ch:0});
                else if (beg.line == end.line)
                    editor.setCursor ({line:beg.line - 0, ch:0});
                else
                    editor.setCursor ({line:end.line - 1, ch:0});
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    toggle_strong: function (button) {
        var editor = assert (this.codemirror (button));
        if (editor.cfg_strong == undefined)
            editor.cfg_strong = this.toggle_cfg ('strong', '**', '**');
        this.toggle_inline (editor, editor.cfg_strong);
        editor.focus ();
    },

    toggle_italic: function (button) {
        var editor = assert (this.codemirror (button));
        if (editor.cfg_italic == undefined)
            editor.cfg_italic = this.toggle_cfg ('em', '*', '*');
        this.toggle_inline (editor, editor.cfg_italic);
        editor.focus ();
    },

    toggle_literal: function (button) {
        var editor = assert (this.codemirror (button));
        if (editor.cfg_literal == undefined)
            editor.cfg_literal = this.toggle_cfg ('string-2', '``', '``');
        this.toggle_inline (editor, editor.cfg_literal);
        editor.focus ();
    },

    toggle_subscript: function (button) {
        var editor = assert (this.codemirror (button));
        if (editor.cfg_subscript == undefined)
            editor.cfg_subscript = this.toggle_cfg ('meta', ':sub:`', '`');
        this.toggle_inline (editor, editor.cfg_subscript);
        editor.focus ();
    },

    toggle_supscript: function (button) {
        var editor = assert (this.codemirror (button));
        if (editor.cfg_supscript == undefined)
            editor.cfg_supscript = this.toggle_cfg ('meta', ':sup:`', '`');
        this.toggle_inline (editor, editor.cfg_supscript);
        editor.focus ();
    },

    ///////////////////////////////////////////////////////////////////////////

    toggle_inline: function (editor, cfg) {
        var cur = editor.getCursor ('end');
        var tok = editor.getTokenAt (cur);
        var sel = editor.getSelection ();

        if (sel && sel.length > 0) {
            if (tok.className == cfg.cls && !sel.match (cfg.inline))
                return; // no toggle if not all selected
            if (tok.className != cfg.cls && tok.className)
                return; // no toggle if something else

            var rep = undefined;
            if (sel.match (cfg.inline)) {
                rep = sel.replace (cfg.rx_markger_beg, '');
                rep = rep.replace (cfg.rx_markger_end, '');
            } else {
                if (sel.match (/^:(.*?):`(.*)`$/))
                    return; // no toggle if another role
                else if (sel.match (/^\s+|\s+$/))
                    return; // no toggle if heading/trailing space
                else
                    rep = String.format (
                        '{0}{1}{2}', cfg.marge_beg, sel, cfg.marker_end
                    );
            }

            editor.replaceSelection (rep);
        }
    },

    toggle_cfg: function (cls, beg, end) {
        var rx = /([\.\?\*\+\^\$\[\]\(\)\{\}\|\-\\])/g;
        var quote = function (value) { return (value).replace (rx, '\\$1'); };

        return {
            cls: cls,
            marge_beg: beg,
            marker_end: end,
            rx_markger_beg: new RegExp ('^' + quote (beg)),
            rx_markger_end: new RegExp (quote (end) + '$'),
            inline: new RegExp ('^'+ quote (beg) + '(?:.*)' + quote (end) +'$')
        }
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    toggle_bullet_list: function (button) {
        console.debug ('[toggle-bullet-list]', button);
    },

    toggle_number_list: function (button) {
        console.debug ('[toggle-number-list]', button);
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    insert_figure: function (button) {
        console.debug ('[insert-figure]', button);
    },

    insert_image: function (button) {
        console.debug ('[insert-image]', button);
    },

    insert_hyperlink: function (button) {
        console.debug ('[insert-hyperlink]', button);
    },

    insert_footnote: function (button) {
        console.debug ('[insert-footnote]', button);
    },

    insert_horizontal_line: function (button) {
        console.debug ('[insert-horizontal-line]', button);
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
});