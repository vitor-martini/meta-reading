"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Container, 
  ContentContainer, 
  BackButtonContainer,
  FieldsContainer, 
  ButtonsContainer,
  ModalContent, 
  ModalButtonsContent,
  AccessKeyContainer,
  AccessKeyWrapper,
  StudentsContainer
} from "./styles";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Student } from "@/components/Student";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import Modal from "react-modal";
import { useTheme } from "styled-components";

const EditClass = () => {
  const theme = useTheme();
  const { id } = useParams(); 
  const router = useRouter();
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState(""); 
  const [classroom, setClassroom] = useState({}); 
  const [newId, setNewId] = useState(undefined); 
  const [accessKey, setAccessKey] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleCopyAccessKey() {
    navigator.clipboard.writeText(accessKey);
    toast.success("Copiado!", {
      autoClose: 1000
    });
  }

  async function confirmDelete() {
    try {
      await api.delete(`/classes/${newId}`);
      sessionStorage.setItem("messageStorage", "Excluído com sucesso!");
      router.push("/teacher/class");
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível excluir");
      }
    }
    setIsModalOpen(false);
  }

  async function handleDelete() {
    setIsModalOpen(true);
  }

  async function handleSave() {
    if (!name) {
      toast.error("Preencha todos os campos!");
      return;
    }

    try {
      if(isNew) {
        const response = await api.post("/classes", {
          name
        });
  
        const { classroom } = response.data;
        setClassroom(classroom);
        setAccessKey(classroom.accessKey);
        setNewId(classroom.id);
        setIsNew(false);
        toast.success("Turma criada com sucesso!");
        return;
      } else {
        await api.put(`/classes/${newId}`, {
          name
        });
        sessionStorage.setItem("messageStorage", "Turma atualizada com sucesso!");
        router.push("/teacher/class");
      }
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível atualizar");
      }
    } 
  }

  useEffect(() => {
    Modal.setAppElement("#__next");
    
    async function fetchClass() {
      if(id === "new") {
        setIsNew(true);
        return;
      }

      try {
        const result = await api.get(`/classes/${id}`);
        const classroom = result?.data?.classroom;

        setClassroom(classroom); 
        setName(classroom.name); 
        setAccessKey(classroom.accessKey); 
        setIsNew(false);
        setNewId(id);
      } catch {
        router.push("/teacher/class");
      }
    }

    fetchClass();
  }, [id]);

  return (
    <Container>
      <Header />
      <ContentContainer>
        <h1>Dados da Turma</h1>
        <BackButtonContainer onClick={() => router.back()}>
          <IoMdArrowRoundBack size={60}/>
        </BackButtonContainer>
        <FieldsContainer>
          <Input
            placeholder="Nome da turma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {
            accessKey && (
              <AccessKeyContainer>
                <label htmlFor="accessKey">Chave de ingresso:</label>
                <AccessKeyWrapper>
                  <p id="accessKey">{accessKey}</p>
                  <FaRegCopy size={60} onClick={handleCopyAccessKey}/>
                </AccessKeyWrapper>
              </AccessKeyContainer>
            )
          }
        </FieldsContainer>
      </ContentContainer>

      <ContentContainer>
        <h2>Leituras</h2>
        {
          classroom?.texts && classroom?.texts.length > 0 && classroom.texts.map(s => (
            <p key={s.id}>{s.name}</p>
          ))
        }
      </ContentContainer>
      {
        classroom?.students && classroom?.students.length > 0 && (
          <ContentContainer>
            <h2>Alunos</h2>
            <StudentsContainer>
            {
              classroom.students.map((s, i) => (
                <Student 
                  key={i}
                  index={i}
                  student={s}
                  setClassroom={setClassroom}
                  classroom={classroom}
                />
              ))
            }
            </StudentsContainer>
          </ContentContainer>
        )
      }
      <ButtonsContainer>
        <Button
          title={"Salvar"}
          width={"100%"}
          maxWidth={"800px"}
          onClick={handleSave}
        />
        {
          !isNew && (
            <Button
              title={"Excluir"}
              width={"100%"}
              maxWidth={"800px"}
              onClick={handleDelete}
              bgColor={theme.COLORS.DARK_RED}
            />
          )
        }
      </ButtonsContainer>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Confirm Deletion"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
              borderRadius: "20px", 
            },
          }}
        >
          <ModalContent>
            <h2>Deseja mesmo excluir?</h2>
            <ModalButtonsContent>
              <Button title={"Sim"} width={"100%"} onClick={confirmDelete} />
              <Button title={"Não"} width={"100%"} onClick={() => setIsModalOpen(false)} />
            </ModalButtonsContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EditClass;
