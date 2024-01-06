import Item from "@/components/item/item";
import { useGetProductsQuery } from "@/api/product";
import { IProduct } from "@/interfaces/product";

const ListProductNew = () => {

  const { data: productData } = useGetProductsQuery();

  // Giới hạn hiển thị chỉ 10 sản phẩm
  const limitedProducts = productData?.products ? productData.products.slice(0, 10) : [];

  return (
    <div className="list-new-products hot-sale-scroll p-20 overflow-x-auto">
      <div className="content-list-new-products w-max flex gap-5">
        <div className="content-list-new-products grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {limitedProducts.map((product: IProduct, index: any) => (
            <div className="w-full" key={index}>
              <Item product={product} />
            </div>
          ))}

  </div>
    </div>
    </div>

       
   
  );
};

export default ListProductNew;
