/**
 * Josie WordPress REST API Powered SPA
 *
 * @version 0.1.0
 *
 * @copyright 2014 Josh Pollock (Josh@JoshPress.net)
 * @license GNU General Public License v2+
 * @url https://github.com/Shelob9/Josie-app
 */

jQuery( function () {
    Josie.init( paramsJosie );
} );

(function ( $, app ) {

    /**
     * Bootstrap
     *
     * @since 0.1.0
     */
    app.init = function( params ) {
        app.params = params;
        app.menuItems( params.mainMenuName, params.mainMenuContainer );
        $(document).on ("click", "[josie=internal]", function ( event ) {
            event.preventDefault();
            console.log( this );

            ID = $( this ).attr( 'data-id' );
            if ( $(this).hasClass( 'post-link' ) ) {
                slug = $(this).attr( 'href' );
                app.getSinglePost( ID );
                history.pushState( null, null, document.url + slug );
            }


        });


    };

    /**
     * Handles routing based on URL Hash
     *
     * @TODO Find someone who can't even deal with the bad SEO of this to implement push-states or something.
     *
     * @since 0.1.0
     */
    app.routeEvent = function( ) {

        var hash = window.location.hash.replace(/^.*?#/,'');

        //@TODO Static front-page options!
        //show posts if not hash
        if ( hash == '' || hash == '#' || hash == 'page=1') {
            app.getPosts( 0 );
            app.pagination( 1 );
        }
        //paginate posts
        else if ( hash.indexOf("page") > -1 ) {
            var offset = hash.split("page=");

            app.getPosts( offset[1] );
        }
        //handle taxonomy archives
        else if ( hash.indexOf("taxonomy") > -1 ) {
            if ( hash.indexOf("page") > -1 ) {
                var offset = hash.split("page=");
            }
            else {
                offset = 0;
            }
            var taxonomySplit = hash.split( 'taxonomy=');

            if ( hash.indexOf( '&term=') > -1 ) {
                var termSplit = hash.split( '&term=');

                var term = termSplit[1];
                var taxonomySplit2 = taxonomySplit[1].split( '&');
                var taxonomy = taxonomySplit2[0];
                if ( taxonomy == 'category' ) {
                    taxonomy = 'category_name';
                }

            }else{
                var term = 0;
                var taxonomy = taxonomySplit[1];

            }

            if ( term == 0 ) {
                app.listTerms( taxonomy );
            }
            else {
                app.term( taxonomy, term, offset );

            }

        }
        //single posts
        else if ( hash > 0 ) {
            app.getSinglePost( hash );
        }


    };

    /**
     * Get posts
     *
     * @param offset The page of results.
     *
     * @since 0.1.0
     */
    app.getPosts  = function( offset ) {
        var postsURL = app.params.rootURL + '/posts?filter[posts_per_page]=' +app.params.postsPerPage;
        if ( undefined != offset && 0 != offset ) {
            var nextPosts = offset * app.params.postsPerPage;
            postsURL += '&filter[offset]=' + nextPosts;

        }
        else {
            var offset = 1;
        }


        $.ajax({
            type: 'GET',
            url: postsURL,
            dataType: 'json',
            success: function(posts){
                app.emptyContainer();
                $(app.params.mainContainer).fadeIn();
                $.each( posts, function(index, post) {

                    var source = $('#posts').html();
                    var template = Handlebars.compile(source);
                    var html = template(post);

                    $(app.params.mainContainer).append(html);


                });

                app.pagination( offset );
            },
            error: function(error){
                console.log(error);
            }

        });
    };

    /**
     * Get a single post
     *
     * @param ID The post ID
     *
     * @since 0.1.0
     */
    app.getSinglePost = function( ID ) {

        $.ajax({
            type: 'GET',
            url: app.params.rootURL + '/posts/' + ID,
            dataType: 'json',
            success: function(post) {

                app.emptyContainer();
                var source = $('#post').html();
                var template = Handlebars.compile(source);
                var html = template(post);

                $(app.params.mainContainer).append(html).fadeIn();

            },
            error: function(error){
                console.log(error);
            }

        });

    };

    /**
     * List terms in a taxonomy
     *
     * @param taxonomy
     *
     * @since 0.1.0
     */
    app.listTerms = function( taxonomy ) {
        $.ajax({
            type: 'GET',
            url: app.params.rootURL + '/taxonomies/' + taxonomy + '/terms',
            dataType: 'json',
            success: function(terms){

                $.each( terms, function(index, term) {
                    app.emptyContainer();
                    term.taxonomy = taxonomy;
                    var source = $('#terms').html();
                    var template = Handlebars.compile(source);
                    var html = template(term);
                    $(app.params.mainContainer).append(html).fadeIn();
                });

            },
            error: function(error){
                console.log(error);
            }

        });
    };

    /**
     * List posts with a specific term in a specific taxonomy
     *
     * @param taxonomy The taxonomy's slug
     * @param slug Term slug or ID
     * @param offset Page offset
     *
     * @since 0.1.0
     */
    app.term = function( taxonomy, slug, offset ) {
        $.ajax({
            type: 'GET',
            url: app.params.rootURL + '/posts?filter[' + taxonomy + ']=' + slug,
            dataType: 'json',
            success: function(posts){
                app.emptyContainer();
                $(app.params.mainContainer).fadeIn();
                $.each( posts, function(index, post) {
                    var source = $('#posts').html();
                    var template = Handlebars.compile(source);
                    var html = template(post);

                    $(app.params.mainContainer).append(html).fadeIn();
                    if ( undefined == offset ) {
                        offset = 1;
                    }

                });

            },
            error: function(error){
                console.log(error);
            }

        });
    };

    /**
     * Handles pagination.
     *
     * @TODO Check that we have more posts before doing next.
     *
     * @param current Current Page
     *
     * @since 0.1.0
     */
    app.pagination = function( current ) {
        var currentPage = parseInt( current );
        var next = currentPage;
        next += 1;
        var html = '<ul class="pagination" role="menubar" aria-label="Pagination" id="pagination">';

        if ( current > 1 ) {
            var previous = currentPage;
            previous -= 1;
            html += '<li class="arrow unavailable" aria-disabled="true">';
            html += '<a href="#page=' + previous + '" title="Previous Page">&laquo; Previous</a></li>';
        }

        html += '<li class="arrow"><a href="#page=';
        html += next;
        html +='" title="Next Page">Next &raquo;</a></li>';


        html += '</div>';


        $(app.params.mainContainer).append(html);
    };

    /**
     * The menu items.
     *
     * @requires The Josie API Plugin be installed on source WP Site for the menus endpoint.
     *
     * @todo drop-down support?
     *
     * @param menuName Name of menu.
     * @param menuContainer Container to populate menu lis into.
     *
     * @since 0.1.0
     */
    app.menuItems = function( menuName, menuContainer ) {
        if ( false == menuName ) {
            return;
        }
        $.ajax({
            type: 'GET',
            url: app.params.rootURL + '/jwp/menus/' + menuName,
            dataType: 'json',
            success: function(items){

                $.each( items, function(index, item) {
                    if ( item.object == 'post' || item.object == 'page') {
                        $(menuContainer).append(
                            '<li>' +
                                '<a href="#' + item.ID + '">' + item.title + '</a>' +
                            '</li>'
                        );
                    } else if ( item.object == 'category' || item.object == 'tag' ) {
                        $(menuContainer).append(
                            '<li>' +
                             '<a href="#taxonomy=' + item.object + '&term=' + item.title + '">' + item.title + '</a>' +
                            '</li>'
                        );
                    }
                    else if ( item.object == 'custom' ) {
                        $(menuContainer).append(
                            '<li>' +
                                '<a href="'+item.url +'">' + item.title + '</a>' +
                            '</li>'
                        );
                    }

                });

            },
            error: function(error){
                console.log(error);
            }

        });
    };

    /**
     * Get URL Params
     *
     * @source http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
     *
     * @param sParam
     * @returns {*}
     * @constructor
     */
    app.urlParams = function( sParam ) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam) {
                return sParameterName[1];
            }
        }

    },

    /**
     * Empty main container
     *
     * @todo Make animation not suck.
     *
     * @since 0.1.0
     */
    app.emptyContainer = function() {
        $( app.params.mainContainer).fadeOut().empty();
    };


})( jQuery, window.Josie || ( window.Josie = {} ) );


$( document ).ready(function() {
    Josie.routeEvent();

    /**
     * Date Format
     * Converts UNIX Epoch time to DD.MM.YY
     * 1343691442862 -> 31.07.12
     * Usage: {{dateFormat yourDate}}
     *
     * @source https://github.com/clintioo/handlebars-date-helpers/blob/master/handlebars-helpers.1.0.0.js
     * @license DWETFUW
     */
    Handlebars.registerHelper('dateFormat', function(context) {
        var date = new Date(context),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = String(date.getFullYear()).substr(2,3);
        return (day < 10 ? '0' : '') + day + '.' + (month < 10 ? '0' : '') + month + '.' + year;
    });

    /**
     * Helper for listing categories
     * @todo abstract for all terms
     *
     * @since 0.1.0
     */
    Handlebars.registerHelper('categories', function(items, options) {
        var out = "Categories: <ul class='post-categories inline-list'>";

        for(var i=0, l=items.length; i<l; i++) {
            var slug = items[i].slug;
            out = out + "<li><a href='#taxonomy=category&term="+slug+"'>" + options.fn(items[i]) + "</a></li>";

        }

        return out + "</ul>";
    });


    /**
     * Handlbars Helper for internal links
     *
     * Usage {{link this url link text linkClass}}
     *
     * All params optional except object
     *
     * Set linkClass to 'term-link' when using for taxonomy link
     *
     */
    Handlebars.registerHelper('link', function( object, url, text, linkClass ) {

        if ( undefined == url || '' === url || 'object' == typeof( url ) || 'array' == typeof( url ) ) {
            url = object.link;
        }

        url = Handlebars.escapeExpression(url);

        if ( undefined === text || '' === text || 'object' == typeof( text ) || 'array' == typeof( text ) ) {
            text = object.title;
        }

        text = Handlebars.escapeExpression(text);

        siteURL = stripTrailingSlash( paramsJosie.siteURL );
        url = url.split( siteURL );
        url = url[1];
        url = stripTrailingSlash( url );
        url = url.split( '/');
        url = url[1];


        ID = object.ID;
        ID = Handlebars.escapeExpression( ID );

        if ( undefined === linkClass || '' === linkClass || 'object' == typeof( linkClass )  || 'array' == typeof( linkClass ) ) {
            linkClass = 'post-link';
        }

        linkClass = Handlebars.escapeExpression( linkClass );

        ID = Handlebars.escapeExpression( ID );

        titleText = "Read";
        if ( object.title ) {
            titleText = object.title;
        }

        return new Handlebars.SafeString(
            "<a id='link-" + ID + "' href='" + url + "' title='" + titleText  + "' class='" + linkClass + "' josie='internal' data-id='" + ID + "'>" + text + "</a>"
        );

    });

    //run router on hash change (IE URL change)
    //$(window).on('hashchange', Josie.routeEvent);



    //intitialize foundation
    $(document).foundation();

    function stripTrailingSlash(str) {
        if (str.substr(-1) == '/') {
            return str.substr(0, str.length - 1);
        }
        return str;
    }





});

