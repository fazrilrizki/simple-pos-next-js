import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/mock";
import { ProductMenuCard } from "@/components/shared/product/ProductMenuCard";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { create } from "domain";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [createProductDialogOpen, setStateCreateProductDialogOpen] = useState(false);

  const { data: products, isLoading: productIsLoading } = api.product.getProducts.useQuery();

  const { mutate: createProduct } = api.product.createProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      createProductForm.reset();
    }
  });

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema)
  });

  const handleSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uploadedImageUrl) {
      return alert("Please upload image url");
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uploadedImageUrl
    })
    setStateCreateProductDialogOpen(false)
  }

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog  open={createProductDialogOpen}
            onOpenChange={setStateCreateProductDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Product</AlertDialogTitle>
              </AlertDialogHeader>


              <Form {...createProductForm}>
                <ProductForm onSubmit={handleSubmitCreateProduct} onChangeImageUrl={setUploadedImageUrl}/>
              </Form>

              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button onClick={createProductForm.handleSubmit(handleSubmitCreateProduct)}>
                      Create Category
                  </Button>
              </AlertDialogFooter>
            </AlertDialogContent>

          </AlertDialog>


        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {
          products?.map((product) => {
            return <ProductCatalogCard
              key={product.id}
              name={product.name}
              price={product.price}
              image={product.imageUrl ?? ""}
              category={product.category.name}
            />
          })
        }
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
