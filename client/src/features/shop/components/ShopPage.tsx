import ShopCardItem from './ShopCardItem';
import { useShopProducts } from '../stores/ShopProductDataContext';

type ShopPageProps = {
  index: number;
};

const ITEMS_PER_PAGE = 9;

const ShopPage: React.FC<ShopPageProps> = ({ index }) => {
  const { products, loading, error } = useShopProducts();

  const start = (index - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentProducts = products.slice(start, end);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;
  if (currentProducts.length === 0)
    return <p>No products found on this page.</p>;

  return (
    <div className="flex flex-col gap-10">
      {/* Normal shop grid */}
      <div className="w-full h-auto grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-3">
        {currentProducts.map((product) => (
          <ShopCardItem
            key={product._id}
            id={product._id}
            imgSrc={product.imageUrl}
            itemName={product.name}
            itemPrice={product.price}
          />
        ))}
      </div>

      {/* AR Scene with NFT image tracking for each product (raw HTML) */}
      <div className="w-full h-[500px]">
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{
            __html: `
              <a-scene
                vr-mode-ui="enabled: false;"
                renderer="logarithmicDepthBuffer: true;"
                embedded
                arjs="trackingMethod: best; sourceType: webcam;debugUIEnabled: false;"
                style="width: 100%; height: 100%;"
              >
                ${currentProducts
                  .map(
                    (product) => `
                  <a-nft
                    type="nft"
                    url="${product.nftDescriptorUrl}"
                    smooth="true"
                    smoothCount="10"
                    smoothTolerance=".01"
                    smoothThreshold="5"
                  >
                    ${
                      product.modelUrl
                        ? `
                      <a-entity
                        gltf-model="${product.modelUrl}"
                        scale="5 5 5"
                        position="2 -15 0"
                        rotation="-90 0 0"
                      ></a-entity>
                    `
                        : `
                      <a-image
                        src="${product.imageUrl}"
                        position="0 0.5 0"
                        width="1"
                        height="1"
                      ></a-image>
                    `
                    }
                    <a-text
                      value="${product.name}"
                      position="0 -0.5 0"
                      align="center"
                      color="white"
                    ></a-text>
                  </a-nft>
                `,
                  )
                  .join('')}
                <a-entity camera></a-entity>
              </a-scene>
            `,
          }}
        />
      </div>
    </div>
  );
};

export default ShopPage;
