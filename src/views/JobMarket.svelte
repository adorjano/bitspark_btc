<!-- JobMarket.svelte -->
<script>
  import Menu from "../components/Sidebar/Sidebar.svelte";
  import JobMarket from "../components/JobMarket/JobMarketWidget.svelte";
  import Footer from "../components/Footers/Footer.svelte";
  import { contentContainerClass } from "../helperStore.js";
  import Banner from "../components/Banner.svelte";
  import ToolBar from "../components/Toolbar/Toolbar.svelte";

  let bannerImage = "../../img/Banner1u.png";
  let title = "BitSpark";
  let subtitle = "job market";
</script>

<main class="overview-page">
  <Menu />
  <div class="flex-grow">
    <Banner {bannerImage} {title} {subtitle} show_right_text={false} />
    <ToolBar />
    <div class={$contentContainerClass}>
      <JobMarket />
    </div>
  </div>
  <Footer />
</main>
