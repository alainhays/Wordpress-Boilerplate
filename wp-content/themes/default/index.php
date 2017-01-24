<?php get_header(); ?>

<sectio class="blog__listing">
    <div class="row">
        <div class="span4">
            <?php if ( have_posts() ) { while ( have_posts() ) { the_post(); ?>
            <h2><a href="<?=the_permalink();?>"><?=the_title();?></a></h2>
            <p><?=the_excerpt();?></p>
            <a class="button rounded" href="<?=the_permalink();?>">Read More..</a>
        	<? } } ?>
        </div>
    </div>
</section>

<?php get_footer(); ?>
