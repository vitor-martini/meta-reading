"use client";
import { Container, ContentContainer, Logo } from "./styles";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import roles from "@/lib/roles";

const HomeTeacher = () => {
  const { user, getAuthUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      const authUser = await getAuthUser();
      if (authUser?.role !== roles.TEACHER) {
        router.push("/");
      }
    };

    fetchUserRole();
  }, [user]);
  
  return (
    <Container>
      <Header/>
      <ContentContainer>
        <Logo src="/favicon.png" alt="Logo"/>
        <h1>Gerencie turmas e leituras</h1>
      </ContentContainer>
    </Container>
  );
};

export default HomeTeacher;
