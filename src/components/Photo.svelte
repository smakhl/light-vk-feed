<script>
    import { selectPhoto } from '../utils/selectPhoto';

    export let photo;
    export let width;

    const imgProps = selectPhoto(photo, width);
</script>

<style></style>

<!-- prettier-ignore -->
<img loading="lazy" alt="" {...imgProps} />
