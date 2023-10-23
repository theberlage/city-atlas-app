<script lang="ts">
	import { homePage } from '$lib/shared/slides'
</script>

<div class="about">
	<div class="body">
		<p class="project">{$homePage.frontmatter.meta.heading}</p>
		<div class="html">{@html $homePage.html}</div>
	</div>
</div>

<style>
	.about {
		grid-column: 1 / 5;
		grid-row: map;
		background-color: rgba(255, 255, 255, 0.9);
		padding-left: 20px;
		padding-right: 20px;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		z-index: 2;
		display: flex;
		justify-content: center;
		align-items: center;
    line-height: 1.3;
	}
	.body {
		max-width: 600px;
		max-height: 100%;
	}
  .project {
		font-size: 0.8rem;
    margin-bottom: 0;
	}
	.html {
		hyphens: auto;
		text-align: justify;
		text-justify: inter-word;
		columns: 1;
	}
  :global(ul) {
		margin-left: 0;
		padding-left: 0;
		list-style-type: none;
	}
	:global(a) {
		color: blue;
		text-decoration: none;
	}
	:global(a:hover) {
		color: black;
		text-decoration: none;
	}
	@media all and (max-width: 800px) {
		.body {
			height: 100%;
		}
		.html {
			columns: 1;
		}
	}
</style>
