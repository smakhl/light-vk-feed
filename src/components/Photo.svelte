<script>
    import { selectPhoto } from '../utils/selectPhoto';

    export let photo;

    const photoSrc = selectPhoto(photo, 600);
</script>

<!-- prettier-ignore -->
<img loading="lazy" src={photoSrc} alt="" srcset="">

<style>
    img {
        width: 100%;
    }
</style>
