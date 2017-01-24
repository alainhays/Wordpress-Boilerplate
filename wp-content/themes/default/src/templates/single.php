<?php get_header(); ?>
<?php the_post(); ?>

<sectio class="blog__content">
    <div class="row">
        <div class="span12">
            <div class="featured__image" style="background-image:url('<?php the_post_thumbnail_url(); ?>')"></div>
            <h2><?php echo the_title();?></h2>
            <?php echo the_content();?>
            Written By: <?php echo the_author();?><br>
            Date: <?php echo the_date();?><br>
            Categories: <span><?php echo get_the_category_list(', ');?></span>
        </div>
    </div>
</section>

<?php get_footer(); ?>
