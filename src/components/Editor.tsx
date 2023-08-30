"use client"

import TextareaAutosize from "react-textarea-autosize";
import {useForm} from "react-hook-form"
import { PostCreationRequest, PostValidator } from "@/lib/validators/post";
import {zodResolver} from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs"
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";


export const Editor = ({subredditId}: {subredditId: string}) => {

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      title: "",
      content: null
    },
  });

  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  

  const initializeEditor = useCallback(async () => {
    
    const EditorJS   = (await import("@editorjs/editorjs")).default
    const Header     = (await import("@editorjs/header")).default
    const Embed      = (await import("@editorjs/embed")).default
    const Table      = (await import("@editorjs/table")).default
    const List       = (await import("@editorjs/list")).default
    const Code       = (await import("@editorjs/code")).default
    const LinkTool   = (await import("@editorjs/link")).default
    const InlineCode = (await import("@editorjs/inline-code")).default
    const ImageTool  = (await import("@editorjs/image")).default

    if(!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your post....",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          LinkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link"
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], "imageUploader");
                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl
                    }
                  }
                }
              }
            }
          },
          List: List,
          code: Code,
          InlineCode: InlineCode,
          table: Table,
          embed: Embed
        },
      });
    };
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for(const [_key, value] of Object.entries(errors)) {
        toast({
          title: "something went wrong",
          description: (value as {message: string}).message,
          variant: "destructive"
        })
      }
    };
  }, [errors]);
  

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    };
  }, []);

  useEffect(() => {
    const init = async() => {
      await initializeEditor();

      setTimeout(()=> {
        _titleRef.current?.focus();
      }, 0);
    };

    if(isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    };
  }, [isMounted, initializeEditor]);


  const {mutate: createPost} = useMutation({
    mutationFn: async ({title, content, subredditId}: PostCreationRequest) => {
      const payload: PostCreationRequest = {
        title,
        content, 
        subredditId
      };

      const {data} = await axios.post("/api/subreddit/post/create", payload );

      return data
    },
    onError: () => {
      return toast({
        title: "Something went wrong",
        description: "Yout post was not published, please try again later",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);

      router.refresh();

      return toast({
        title: "Published",
        description: "Your post has been published"
      });
    },
  });

  const onSubmit = async (data: PostCreationRequest) => {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      subredditId
    };

    createPost(payload);
  };

  const {ref: titleRef, ...rest} = register("title");

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form id="subreddit-post-form" className="w-fit" onSubmit={handleSubmit(onSubmit)}>
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-xl font-bold focus:outline-none"
            ref={(e) => {
              titleRef(e)
              // @ts-ignore
              _titleRef.current = e
            }}
            {...rest}
          />
          <div id="editor" className="min-h-[500px]"/>
        </div>
      </form>
    </div>
  );
};
