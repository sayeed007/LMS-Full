import { baseApi } from './baseApi';

export type ExportFormat = 'json' | 'csv' | 'qti';

export interface ImportRequest {
  questionBankId: string;
  format: ExportFormat;
  data: string;
}

export interface ImportResponse {
  status: string;
  message: string;
  data: {
    importedCount: number;
    totalProvided: number;
    questions: Array<{
      _id: string;
      text: string;
      type: string;
    }>;
  };
}

export const questionImportExportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Export questions
    exportQuestions: builder.query<
      Blob,
      {
        questionBankId: string;
        format?: ExportFormat;
        includeMetadata?: boolean;
      }
    >({
      query: ({ questionBankId, format = 'json', includeMetadata = true }) => ({
        url: `/questions/question-bank/${questionBankId}/export`,
        params: { format, includeMetadata: includeMetadata.toString() },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Import questions
    importQuestions: builder.mutation<ImportResponse, ImportRequest>({
      query: ({ questionBankId, format, data }) => ({
        url: `/questions/question-bank/${questionBankId}/import`,
        method: 'POST',
        body: { format, data },
      }),
      invalidatesTags: (result, error, { questionBankId }) => [
        { type: 'Question', id: 'LIST' },
        { type: 'QuestionBank', id: questionBankId },
      ],
    }),
  }),
});

export const {
  useLazyExportQuestionsQuery,
  useImportQuestionsMutation,
} = questionImportExportApi;
