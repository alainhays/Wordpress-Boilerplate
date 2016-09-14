const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const watch = require( 'gulp-watch' );
const plumber = require( 'gulp-plumber' );
const notify = require( 'gulp-notify' );
const concat = require( 'gulp-concat' );
const replace = require( 'gulp-replace' );
const rename = require( 'gulp-rename' );
const stylus = require( 'gulp-stylus' );
const postcss = require( 'gulp-postcss' );
const autoprefixer = require( 'autoprefixer' );
const cleanCSS = require( 'gulp-clean-css' );
const uglify = require( 'gulp-uglify' );
const inline = require( 'gulp-inline-source' );
const sourcemaps = require( 'gulp-sourcemaps' );
const imagemin = require( 'gulp-imagemin' );
const rev = require( 'gulp-rev' );
const revReplace = require( 'gulp-rev-replace' );
const cssRef = require( 'gulp-rev-css-url' );

const svgmin = require( 'gulp-svgmin' );
const svgstore = require( 'gulp-svgstore' );

const fs = require( 'fs' );
const del = require( 'del' );
const through = require( 'through2' );
const path = require( 'path' );

const vinylPaths = require( 'vinyl-paths' );

const browserSync = require( 'browser-sync' ).create();

const eslint = require( 'gulp-eslint' );
const webpack = require( 'webpack' );

const argv = require( 'yargs' ).argv;
const gulpif = require( 'gulp-if' );

const pkg = require( './package.json' );

/*----------------------------*\
	Clean
\*----------------------------*/
gulp.task( 'clean:css', ['unrev'], function( cb ) {
	del( ['./assets/css/*'], cb );
} );
gulp.task( 'clean:js', ['unrev'], function( cb ) {
	del( ['./assets/js/*'], cb );
} );
gulp.task( 'clean:all', function( cb ) {
	del( ['./assets/**/*', './*.php'], cb );
} );

gulp.task( 'unrev', function( cb ) {

	if( !argv.production ) { cb(); return; }

	const vp = vinylPaths();
	gulp.src( ['./assets/**/*.*', '!./assets/rev-manifest.json'] )
	.pipe( plumber() )
	.pipe( vp )
	.pipe( rename( function( path ) {
		path.basename = path.basename.replace( /-[a-zA-Z0-9]{8,10}$/, '' );
	} ) )
	.pipe( gulp.dest( './assets' ) )
	.on( 'end', function() {
		if( vp.paths ) {
			del( vp.paths, cb );
		}
	} );
} );

/*----------------------------*\
	Compile Stylus
\*----------------------------*/
gulp.task( 'css', ['clean:css'], function() {
	return gulp.src( './src/styl/main.styl' )
	.pipe( plumber( {
		errorHandler: notify.onError( {
			title: 'CSS Error',
			message: '<%= error.message %>',
			icon: 'http://littleblackboxdev.co.uk/gulp-logo.png'
		} )
	} ) )
	.pipe( sourcemaps.init() )
	.pipe( stylus( {compress: true, url: 'embedurl'} ) )
	.pipe( postcss( [ autoprefixer() ] ) )
	.pipe( gulpif( argv.production, cleanCSS() ) )
	.pipe( sourcemaps.write( '.' ) )
	.pipe( gulp.dest( './assets/css' ) )
	.on( 'end', browserSync.reload );
} );

/*----------------------------*\
	Icons
\*----------------------------*/
gulp.task( 'icons', ['unrev'], function() {
	return gulp.src( './src/icons/*.svg' )
	.pipe( plumber() )
	.pipe( rename( {prefix: 'icon-'} ) )
	.pipe( svgmin( {plugins: [{removeTitle: true}]} ) )
	.pipe( svgstore( {inlineSvg: true} ) )
	.pipe( gulp.dest( './assets/images' ) )
	.on( 'end', browserSync.reload );
} );


/*----------------------------*\
	Optimize images
\*----------------------------*/
gulp.task( 'images', ['unrev'], function() {
	return gulp.src( './src/images/**' )
	.pipe( plumber() )
	.pipe( imagemin( {progressive: true} ) )
	.pipe( gulp.dest( './assets/images' ) )
	.on( 'end', browserSync.reload );
} );

/*----------------------------*\
	JavaScript
\*----------------------------*/
gulp.task( 'lint:js', ['clean:js'], function() {

	gulp.src( ['./src/js/**/*.js', '!./src/js/vendor/**/*'] )
	.pipe( plumber( {
		errorHandler: notify.onError( {
			title: 'ESLint',
			message: '<%= error.message %>'
		} )
	} ) )
	.pipe( eslint() )
	.pipe( eslint.format() )
	.pipe( eslint.results( function( results ) {
		if( results.warningCount > 0 || results.errorCount > 0 ) {
			throw new gutil.PluginError( {
				plugin: 'ESLint',
				message: results.warningCount + ' warning' + ( results.warningCount !== 1 ? 's' : '' ) + '. ' + results.errorCount + ' error' + ( results.errorCount !== 1 ? 's' : '' ) + '.'
			} );
		}
	} ) );

} );

gulp.task( 'webpack', ['lint:js'], function( cb ) {
	// run webpack
	webpack( {
		context: __dirname + '/src/js',
		entry: './main.js',
		output: {
			path: __dirname + '/assets/js',
			filename: 'main.js'
		},
		devtool: '#inline-source-map',
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					exclude: /(node_modules|bower_components)/,
					loader: 'babel-loader',
					query: {
						'presets': ['es2015']
					}
				}
			]
		}
	}, function( err, stats ) {
		if( err ) throw new gutil.PluginError( 'webpack', err );
		gutil.log( '[webpack]', stats.toString( {
			colors: true
		} ) );
		cb();
	} );
} );

gulp.task( 'js', ['webpack'], function() {
	return gulp.src( 'assets/js/main.js' )
	.pipe( plumber() )
	.pipe( sourcemaps.init( {loadMaps: true} ) )
	.pipe( uglify() )
	.pipe( sourcemaps.write( '.' ) )
	.pipe( gulp.dest( 'assets/js' ) )
	.on( 'end', browserSync.reload );
} );


gulp.task( 'copy:fonts', ['unrev'], function() {
	return gulp.src( './src/fonts/*' )
	.pipe( plumber() )
	.pipe( gulp.dest('./assets/fonts' ) )
	.on( 'end', browserSync.reload );
} );
gulp.task( 'copy:templates', ['unrev'], function() {
	return gulp.src( './src/templates/**/*' )
	.pipe( plumber() )
	.pipe( replace( /(["'])assets\//g, '$1<?=get_template_directory_uri()?>/assets/' ) )
	.pipe( gulp.dest( '.' ) )
	.on( 'end', browserSync.reload );
} );


gulp.task( 'inline', ['rev'], function() {
	return gulp.src( ['./**/*.php', '!./src/**/*', '!node_modules/**/*'] )
	.pipe( plumber() )
	.pipe( gulpif( argv.production, inline( {compress: false, handlers: [
		function( source, context, next ) {
			if( source.fileContent && !source.content && ( source.type === 'css' ) ) {
				source.replace = '<style>' + source.fileContent.replace( /url\(\.\./g, 'url(<?=get_template_directory_uri()?>/assets' ) + '</style>';
			}
			next();
		}
	]} ) ) )
	.pipe( gulpif( !argv.production, inline( {compress: false, ignore: ['css']} ) ) )
	.pipe( gulp.dest( '.' ) );
} );

/*----------------------------*\
	File revisioning
\*----------------------------*/

// Remove originals
const rmOrig = function() {
	return through.obj( function( file, enc, cb ) {
		if( file.revOrigPath ) {
			fs.unlink( file.revOrigPath, function( err ) {
			} );
		}
		this.push( file );
		return cb();
	} );
};

// Save revisioned files, removing originals
gulp.task( 'revision', ['assets'], function( cb ) {

	if( !argv.production ) { cb(); return; }

	return gulp.src( ['assets/**/*.*', '!**/*.map', '!assets/rev-manifest.json'], {base: path.join( process.cwd(), 'assets' ) } )
	.pipe( plumber() )
	.pipe( rev() )
	.pipe( cssRef() ) // replace references in CSS
	.pipe( gulp.dest( './assets' ) )
	.pipe( rmOrig() ) // remove originals
	.pipe( rev.manifest( {merge: true} ) ) // save manifest
	.pipe( gulp.dest( './assets' ) );
} );

// Replace references to files
gulp.task( 'rev', ['revision'], function( cb ) {

	if( !argv.production ) { cb(); return; }

	const manifest = gulp.src( './assets/rev-manifest.json' );

	return gulp.src( ['./**/*.php', '!./src/**/*', '!node_modules/**/*'] )
	.pipe( plumber() )
	.pipe( revReplace( {
		manifest: manifest,
		replaceInExtensions: ['.php']
	} ) )
	.pipe( gulp.dest( '.' ) );
} );

/*----------------------------*\
	File watcher
\*----------------------------*/
gulp.task( 'default', ['cleanbuild'], function() {

	if( !argv.production ) {

		const protocol = pkg.https ? 'https' : 'http';

		browserSync.init( {
			proxy: protocol + '://localhost',
			open: 'external'
		} );

		watch( ['./src/styl/**/*'], function() {
			gulp.start( 'css' );
		} );

		watch( ['./src/js/**/*'], function() {
			gulp.start( 'js' );
		} );

		watch( ['./src/fonts/**/*'], function() {
			gulp.start( 'copy:fonts' );
		} );

		watch( ['./src/templates/**/*'], function() {
			gulp.start( 'copy:templates' );
		} );

		watch( ['./src/icons/**/*'], function() {
			gulp.start( 'icons' );
		} );

		watch( ['./src/images/**/*'], function() {
			gulp.start( 'images' );
		} );

	}

} );



gulp.task( 'assets', ['images', 'icons', 'copy:templates', 'copy:fonts', 'css', 'js'] );

/**
 * build
 * unrev -> [images, icons, copy:templates, copy:fonts, css, js] -> rev -> inline
 */

gulp.task( 'build', ['inline'] );

/**
 * cleanbuild
 * clean:all -> build
 */
gulp.task( 'cleanbuild', ['clean:all'], function() {
	gulp.start( 'build' );
} );
