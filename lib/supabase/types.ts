export type UserRole = "professor" | "aluno";
export type ProcessStatus = "pending" | "processing" | "done" | "error";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nome: string;
          telefone: string | null;
          tipo: UserRole;
          avatar_url: string | null;
          criado_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "criado_em">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      livros: {
        Row: {
          id: string;
          titulo: string;
          slug: string;
          professor_id: string;
          drive_file_id: string | null;
          status: ProcessStatus;
          total_episodios: number;
          descricao: string | null;
          thumb_url: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["livros"]["Row"], "criado_em" | "atualizado_em">;
        Update: Partial<Database["public"]["Tables"]["livros"]["Insert"]>;
      };
      episodios: {
        Row: {
          id: string;
          livro_id: string;
          numero: number;
          titulo: string;
          chars: number;
          audiobook_url: string | null;
          video_url: string | null;
          slides_url: string | null;
          thumb_url: string | null;
          status: ProcessStatus;
          criado_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["episodios"]["Row"], "criado_em">;
        Update: Partial<Database["public"]["Tables"]["episodios"]["Insert"]>;
      };
      quiz_perguntas: {
        Row: {
          id: string;
          episodio_id: string;
          pergunta: string;
          opcao_a: string;
          opcao_b: string;
          opcao_c: string;
          opcao_d: string;
          resposta_correta: "a" | "b" | "c" | "d";
          criado_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_perguntas"]["Row"], "criado_em">;
        Update: Partial<Database["public"]["Tables"]["quiz_perguntas"]["Insert"]>;
      };
      quiz_respostas: {
        Row: {
          id: string;
          aluno_id: string;
          episodio_id: string;
          pergunta_id: string;
          resposta_dada: "a" | "b" | "c" | "d";
          correta: boolean;
          respondido_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["quiz_respostas"]["Row"], "respondido_em">;
        Update: Partial<Database["public"]["Tables"]["quiz_respostas"]["Insert"]>;
      };
      progresso: {
        Row: {
          id: string;
          aluno_id: string;
          livro_id: string;
          episodios_completados: number[];
          nota_final: number | null;
          aprovado: boolean;
          certificado_url: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: Omit<Database["public"]["Tables"]["progresso"]["Row"], "criado_em" | "atualizado_em">;
        Update: Partial<Database["public"]["Tables"]["progresso"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
