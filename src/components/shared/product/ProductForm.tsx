import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { ProductFormSchema } from "@/forms/product";
import { uploadFileToSignedUrl } from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { api } from "@/utils/api";
import { SelectValue } from "@radix-ui/react-select";
import { useState, type ChangeEvent } from "react";
import { useFormContext } from "react-hook-form"

type ProductFormProps = {
    onSubmit: (values: ProductFormSchema) => void;
    onChangeImageUrl: (imageUrl: string) => string;
}

export const ProductForm = ({ onSubmit, onChangeImageUrl }: ProductFormProps) => {
    const form = useFormContext<ProductFormSchema>();

    const { data: categories } = api.category.getCategories.useQuery();

      const { mutateAsync: createImageSignedUrl } =  api.product.createProductImageUploadSignedUrl.useMutation()

      const imageChangeHandler = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files?.length > 0) {
            const file = files[0];
            
            if (!file) return;

            const { path, signedUrl, token } = await createImageSignedUrl();

            const imageUrl = await uploadFileToSignedUrl({
                bucket: Bucket.ProductImages,
                file,
                path,
                token,
            });

            onChangeImageUrl(imageUrl);
        }
      }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                        <Select value={field.value} onValueChange={(value: string) => {
                            field.onChange(value);
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Category"></SelectValue>
                            </SelectTrigger>

                            <SelectContent>
                                {
                                    categories?.map(category => {
                                        return <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    })
                                }
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="space-y-1">
                <Label>Product Image</Label>

                <input onChange={imageChangeHandler} type="file" accept="image/*" />
            </div>
        </form>
    )
}