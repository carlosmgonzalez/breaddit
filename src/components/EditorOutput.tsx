"use client"

import dynamic from "next/dynamic"
import Image from "next/image";

const Output = dynamic(async () => (await import("editorjs-react-renderer")).default, {
  ssr: false
});

interface Props {
  content: any;
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem"
  }
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer
}

export const EditorOutput = ({content}: Props) => {
  return (
    // @ts-expect-error
    <Output
      data={content}
      style={style}
      className="text-sm"
      renderers={renderers}
    />
  );
};

function CustomCodeRenderer({data}: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-800 text-sm">
        {data.code}
      </code>
    </pre>
  );
};

function CustomImageRenderer({data}: any) {
  const src = data.file.url;
  console.log(src);

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image
        src={src}
        alt="image"
        className="object-contain"
        fill
      />
    </div>
  );
};