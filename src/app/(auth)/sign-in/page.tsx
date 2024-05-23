'use client'
import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useDebounceValue } from "usehooks-ts"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { signInSchema } from '@/schemas/signInSchema'
import { signUpSchema } from '@/schemas/signUpSchemas'
import axios, { AxiosError } from "axios"
import { ApiResponse } from '@/types/ApiResponse'


function page() {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [ischeckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, useIsSubmitting] = useState(false);

  const debouncedUsername = useDebounceValue(username, 300);

  const { toast } = useToast();
  const router = useRouter();

  //zod implementation

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  });

  useEffect(()=> {
    const checkUsernameUnique = async () => {
      if(debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`);
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username");
        }
        finally {
          setIsCheckingUsername(false);
        }
      }
    }
  }, [debouncedUsername])

  return (
    <div>page</div>
  )
}

export default page